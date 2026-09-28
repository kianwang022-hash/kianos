#!/usr/bin/env python3
"""Small local helpers that reduce Remote Desktop Commander round-trips."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path


SKIP_DIRS = {".git", "node_modules", "dist", ".astro", "__pycache__"}


def run(cmd, *, cwd: Path, check: bool = False) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if check and result.returncode:
        raise RuntimeError(result.stdout.strip() or f"command failed: {cmd}")
    return result


def git(repo: Path, *args: str) -> str | None:
    result = run(["git", *args], cwd=repo)
    if result.returncode:
        return None
    return result.stdout.strip()


def resolve_repo(value: str) -> Path:
    start = Path(value).expanduser().resolve()
    result = run(["git", "rev-parse", "--show-toplevel"], cwd=start)
    if result.returncode:
        raise SystemExit(f"not a git worktree: {start}")
    return Path(result.stdout.strip()).resolve()


def repo_path(repo: Path, value: str) -> Path:
    target = (repo / value).resolve()
    if target != repo and repo not in target.parents:
        raise SystemExit(f"path escapes repo: {value}")
    return target


def parse_worktrees(raw: str | None) -> list[dict[str, str]]:
    if not raw:
        return []
    result: list[dict[str, str]] = []
    current: dict[str, str] = {}
    for line in raw.splitlines():
        if not line:
            if current:
                result.append(current)
                current = {}
            continue
        key, _, value = line.partition(" ")
        if key in {"worktree", "HEAD", "branch"}:
            current[key.lower()] = value
    if current:
        result.append(current)
    return result


def snapshot(repo: Path, status_limit: int = 60) -> dict[str, object]:
    head = git(repo, "rev-parse", "HEAD")
    branch = git(repo, "branch", "--show-current") or "(detached)"
    upstream = git(repo, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
    cached_origin_main = git(repo, "rev-parse", "origin/main")
    ahead = behind = None
    if cached_origin_main and head:
        counts = git(repo, "rev-list", "--left-right", "--count", "origin/main...HEAD")
        if counts:
            left, right = counts.split()
            behind, ahead = int(left), int(right)
    lines = (git(repo, "status", "--porcelain=v1") or "").splitlines()
    return {
        "repo": str(repo),
        "head": head,
        "branch": branch,
        "upstream": upstream,
        "cached_origin_main": cached_origin_main,
        "ahead_of_cached_origin_main": ahead,
        "behind_cached_origin_main": behind,
        "remote_ref_note": "cached local origin/main; verify GitHub separately when freshness matters",
        "dirty_count": len(lines),
        "dirty": lines[:status_limit],
        "dirty_truncated": len(lines) > status_limit,
        "worktrees": parse_worktrees(git(repo, "worktree", "list", "--porcelain")),
    }


def numbered_excerpt(lines: list[str], start: int, end: int) -> str:
    start = max(1, start)
    end = min(len(lines), end)
    return "\n".join(f"{idx}: {lines[idx - 1]}" for idx in range(start, end + 1))


def read_text(path: Path) -> list[str] | None:
    try:
        data = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return None
    return data.splitlines()


def iter_text_files(scope: Path):
    if scope.is_file():
        yield scope
        return
    for root, dirs, files in os.walk(scope):
        dirs[:] = [name for name in dirs if name not in SKIP_DIRS]
        for name in files:
            path = Path(root) / name
            try:
                if path.stat().st_size <= 2_000_000:
                    yield path
            except OSError:
                continue


def packet(args: argparse.Namespace) -> int:
    repo = resolve_repo(args.repo)
    chunks: list[str] = []

    for value in args.file:
        path = repo_path(repo, value)
        lines = read_text(path)
        if lines is None:
            raise SystemExit(f"requested file is missing or not readable UTF-8 text: {value}")
        if len(lines) > args.max_file_lines:
            body = numbered_excerpt(lines, 1, args.max_file_lines)
            body += f"\n[TRUNCATED: {len(lines) - args.max_file_lines} more lines; use --range]"
        else:
            body = numbered_excerpt(lines, 1, len(lines))
        chunks.append(f"## FILE {value}\n{body}")

    for spec in args.range:
        try:
            value, start, end = spec.rsplit(":", 2)
            start_i, end_i = int(start), int(end)
        except ValueError:
            raise SystemExit(f"invalid --range {spec!r}; expected path:start:end")
        if start_i < 1 or end_i < start_i:
            raise SystemExit(f"invalid --range bounds: {spec!r}")
        path = repo_path(repo, value)
        lines = read_text(path)
        if lines is None:
            raise SystemExit(f"requested range file is missing or not readable UTF-8 text: {value}")
        body = numbered_excerpt(lines, start_i, end_i)
        chunks.append(f"## RANGE {value}:{start_i}:{end_i}\n{body}")

    patterns = [re.compile(item, re.IGNORECASE if args.ignore_case else 0) for item in args.grep]
    if patterns:
        candidates: list[dict[str, object]] = []
        seen_paths: set[Path] = set()
        scanned_files = 0
        total_matching_lines = 0

        for scope_value in args.scope or ["."]:
            scope = repo_path(repo, scope_value)
            if not scope.exists():
                raise SystemExit(f"grep scope does not exist: {scope_value}")
            for path in iter_text_files(scope):
                resolved = path.resolve()
                if resolved != repo and repo not in resolved.parents:
                    continue
                if resolved in seen_paths:
                    continue
                seen_paths.add(resolved)
                lines = read_text(resolved)
                if lines is None:
                    continue
                scanned_files += 1
                match_indices: list[int] = []
                pattern_hits: set[int] = set()
                for idx, line in enumerate(lines, start=1):
                    hit_ids = [i for i, pattern in enumerate(patterns) if pattern.search(line)]
                    if hit_ids:
                        match_indices.append(idx)
                        pattern_hits.update(hit_ids)
                if match_indices:
                    rel = resolved.relative_to(repo)
                    total_matching_lines += len(match_indices)
                    candidates.append(
                        {
                            "rel": str(rel),
                            "lines": lines,
                            "match_indices": match_indices,
                            "distinct_patterns": len(pattern_hits),
                            "matching_lines": len(match_indices),
                        }
                    )

        candidates.sort(
            key=lambda item: (
                -int(item["distinct_patterns"]),
                -int(item["matching_lines"]),
                str(item["rel"]),
            )
        )

        included_matches = 0
        files_included = 0
        for item in candidates:
            remaining = args.max_matches - included_matches
            if remaining <= 0:
                break
            selected = list(item["match_indices"])[:remaining]
            lines = list(item["lines"])
            windows: list[tuple[int, int]] = []
            for idx in selected:
                start = max(1, int(idx) - args.context)
                end = min(len(lines), int(idx) + args.context)
                if windows and start <= windows[-1][1] + 1:
                    windows[-1] = (windows[-1][0], max(windows[-1][1], end))
                else:
                    windows.append((start, end))
            body = "\n...\n".join(numbered_excerpt(lines, a, b) for a, b in windows)
            chunks.append(
                f"## GREP {item['rel']} "
                f"[patterns={item['distinct_patterns']}/{len(patterns)} "
                f"hits={item['matching_lines']}]\n{body}"
            )
            included_matches += len(selected)
            files_included += 1

        chunks.append(
            "## GREP SUMMARY\n"
            f"scanned_files={scanned_files} matching_files={len(candidates)} "
            f"matching_lines={total_matching_lines} included_matching_lines={included_matches} "
            f"files_included={files_included} capped={included_matches < total_matching_lines}"
        )

    output = "\n\n".join(chunks) or "[empty packet]"
    if len(output) > args.max_chars:
        output = output[: args.max_chars] + "\n[PACKET TRUNCATED BY --max-chars]"
    print(output)
    return 0


def tail(path: Path, lines: int) -> list[str]:
    try:
        values = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []
    return values[-lines:]


def verify(args: argparse.Namespace) -> int:
    repo = resolve_repo(args.repo)
    log_dir = Path(args.log_dir).expanduser() if args.log_dir else Path(
        tempfile.mkdtemp(prefix="kianos-remote-verify-")
    )
    log_dir.mkdir(parents=True, exist_ok=True)
    shell = shutil.which("zsh") or shutil.which("bash") or "/bin/sh"
    results: list[dict[str, object]] = []
    overall = 0

    for index, command in enumerate(args.cmd, start=1):
        log_path = log_dir / f"{index:02d}.log"
        started = time.monotonic()
        with log_path.open("w", encoding="utf-8") as handle:
            result = subprocess.run(
                command,
                cwd=repo,
                shell=True,
                executable=shell,
                text=True,
                stdout=handle,
                stderr=subprocess.STDOUT,
                check=False,
            )
        item = {
            "command": command,
            "exit_code": result.returncode,
            "duration_ms": round((time.monotonic() - started) * 1000),
            "log": str(log_path),
            "tail": tail(log_path, args.tail),
        }
        results.append(item)
        if result.returncode and not overall:
            overall = result.returncode
        if result.returncode and not args.keep_going:
            break

    report = {
        "ok": overall == 0,
        "commands": results,
        "snapshot": snapshot(repo),
        "log_dir": str(log_dir),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return overall


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Bundle local KianOS reads/checks so Remote needs fewer round-trips."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    snap = sub.add_parser("snapshot", help="compact git/worktree state")
    snap.add_argument("--repo", default=".")
    snap.add_argument("--status-limit", type=int, default=60)

    pack = sub.add_parser("packet", help="bundle exact reads and bounded grep evidence")
    pack.add_argument("--repo", default=".")
    pack.add_argument("--file", action="append", default=[])
    pack.add_argument("--range", action="append", default=[])
    pack.add_argument("--scope", action="append", default=[])
    pack.add_argument("--grep", action="append", default=[])
    pack.add_argument("--context", type=int, default=3)
    pack.add_argument("--max-matches", type=int, default=80)
    pack.add_argument("--max-file-lines", type=int, default=600)
    pack.add_argument("--max-chars", type=int, default=80_000)
    pack.add_argument("--ignore-case", action=argparse.BooleanOptionalAction, default=True)

    check = sub.add_parser("verify", help="run checks once and return compact result + logs")
    check.add_argument("--repo", default=".")
    check.add_argument("--cmd", action="append", required=True)
    check.add_argument("--tail", type=int, default=40)
    check.add_argument("--log-dir")
    check.add_argument("--keep-going", action="store_true")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "snapshot":
        repo = resolve_repo(args.repo)
        print(json.dumps(snapshot(repo, args.status_limit), ensure_ascii=False, indent=2))
        return 0
    if args.command == "packet":
        return packet(args)
    if args.command == "verify":
        return verify(args)
    parser.error("unknown command")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
