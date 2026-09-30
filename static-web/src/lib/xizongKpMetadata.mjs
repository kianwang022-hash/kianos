// A metadata row may contain several explicitly labelled fields. Only split
// before a known bold label, never on ordinary Prompt axes or code-span text.
function metadataLineParts(line) {
  const row=String(line).match(/^(\s{0,4}>\s*)(.*)$/);
  if(!row || !/^\*\*(?:主提示|讲义定位(?: →)?|Outline(?: →)?)(?:\*\*|[：:])/.test(row[2]))return [line];
  const text=row[2];
  const codeSpans=[...text.matchAll(/(`+)[\s\S]*?\1(?!`)/g)]
    .map(match=>[match.index,match.index+match[0].length]);
  const boundaries=[...text.matchAll(/[｜|][ \t]*(?=\*\*(?:主提示|讲义定位(?: →)?|Outline(?: →)?)(?:\*\*|[：:]))/g)]
    .filter(match=>text[match.index-1]!=='\\' && !codeSpans.some(([start,end])=>match.index>=start&&match.index<end));
  if(!boundaries.length)return [line];
  const parts=[];let start=0;
  for(const match of boundaries){parts.push(row[1]+text.slice(start,match.index).trimEnd());start=match.index+match[0].length;}
  parts.push(row[1]+text.slice(start));
  return parts;
}

export function readMetadataDeclaration(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}\\*\\*[：:]?\\s*(.+)$`),
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}[：:]\\*\\*\\s*(.+)$`),
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}[：:]\\s*(.+?)\\*\\*\\s*$`)
  ];
  const declarations = [];
  for (const [lineIndex, line] of String(body).split(/\r?\n/).entries()) {
    for (const [partIndex, part] of metadataLineParts(line).entries()) {
      for (const [formatPriority, pattern] of patterns.entries()) {
        const match = part.match(pattern);
        if (match?.[1]?.trim()) {
          // A newly readable inline field cannot replace an already-effective
          // standalone declaration. Expose disagreements for Content review.
          declarations.push({ value: match[1].trim(), formatPriority: formatPriority + (partIndex ? 3 : 0), lineIndex, partIndex });
          break;
        }
      }
    }
  }
  declarations.sort((a, b) => a.formatPriority - b.formatPriority || a.lineIndex - b.lineIndex || a.partIndex - b.partIndex);
  const values = [...new Set(declarations.map(row => row.value))];
  const conflict = values.length > 1;
  // Preserve already-effective legacy fields. Newly readable but ambiguous
  // whole-line declarations cannot silently choose a replacement. Surface the
  // exact conflicting owner text to inspection; resolving it is Content review.
  const selected = declarations[0];
  const value = conflict && selected?.formatPriority >= 2 ? '' : selected?.value || '';
  return { value, ...(conflict ? { diagnostic: {
    code: 'MULTIPLE_AUTHORED_METADATA_VALUES', label, values,
    effectiveValue: value, resolution: 'CONTENT_REVIEW_REQUIRED'
  } } : {}) };
}


// Only Core's explicit metadata declarations are presentation. Support answers
// and malformed lookalikes are not metadata and must remain meaningful.
export function stripRevisionKpMetadata(body) {
  const labels = ['主提示', '讲义定位 →', '讲义定位', 'Outline →', 'Outline'];
  return String(body || '').split(/\r?\n/).filter(line =>
    !metadataLineParts(line).every(part => labels.some(label => Boolean(readMetadataDeclaration(part, label).value)))
  ).join('\n');
}
