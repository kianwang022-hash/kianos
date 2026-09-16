#!/usr/bin/env python3
"""Declarative manifest aggregator for issue #251 / o5375-o5874."""
from importlib import import_module
PATCHES={}
for i in range(10):
    mod=import_module(f'lexical_manifest_o5375_o5874_p{i}')
    for o,ops in mod.PATCHES.items():
        if o in PATCHES: raise RuntimeError(f'DUPLICATE_MANIFEST_OWNER o{o:04d}')
        PATCHES[o]=ops
