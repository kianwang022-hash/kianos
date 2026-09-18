from pathlib import Path
r=Path('.')
p=r/'static-web/src/components/XizongBlockV6.astro';s=p.read_text()
s=s.replace("String(sourceContact.mode || 'WHOLE_LOGIC_GROUP')", "String(sourceContact.mode || 'NATURAL_SOURCE_UNIT')")
s=s.replace('`MarginNote · ${firstGroupLocators[0]} → ${firstGroupLocators[firstGroupLocators.length - 1]}`','`MarginNote · 相关定位：${firstGroupLocators.join(\'；\')}`')
s=s.replace('`MarginNote · ${allSourceLocators[0]} → ${allSourceLocators[allSourceLocators.length - 1]}`','`MarginNote · 相关定位：${allSourceLocators.join(\'；\')}`')
s=s.replace('`MarginNote · ${locators[0]} → ${locators[locators.length - 1]}`','`MarginNote · 相关定位：${locators.join(\'；\')}`')
s=s.replace('  data-study-object={block.objectId}', '  data-study-object={block.objectId}\n  data-study-source-hash={block.sourceHash || \'\'}',1)
s=s.replace('  if (root) {\n    const objectId', '  if (root) {\n   (() => {\n    const objectId',1)
old="    try { state = { ...state, ...(JSON.parse(localStorage.getItem(storageKey) || 'null') || {}) }; } catch {}"
new='''    const suspend = (message) => {
      root.dataset.xizongStateBlocked = 'true';
      root.inert = true;
      if (!document.querySelector('[data-xizong-state-recovery]')) {
        const notice = document.createElement('p');
        notice.dataset.xizongStateRecovery = '';
        notice.setAttribute('role', 'alert');
        notice.textContent = message;
        root.before(notice);
      }
    };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const saved = JSON.parse(raw);
        const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
        if (!object(saved) || (saved.schema && saved.schema !== 'kianos.xizong.block-state.v2')) throw new Error('Unsupported state');
        if (saved.learned != null && (!object(saved.learned) || Object.values(saved.learned).some((v) => typeof v !== 'boolean'))) throw new Error('Invalid contact evidence');
        if (saved.ratings != null && (!object(saved.ratings) || Object.values(saved.ratings).some((v) => !['unknown','fuzzy','known','mastered'].includes(v)))) throw new Error('Invalid Recall evidence');
        state = { ...state, ...saved };
      }
    } catch {
      suspend('本机学习记录无法安全读取，原数据已保留，本页暂停写入。请先备份记录再恢复；不要直接清除浏览器数据。');
      return;
    }'''
assert old in s;s=s.replace(old,new)
s=s.replace("    const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };",'''    const save = () => {
      if (root.dataset.xizongStateBlocked === 'true') return false;
      try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
      catch { suspend('本次学习状态未能保存，本页已暂停。之前记录仍保留，请先备份或释放本机空间后重新打开。'); return false; }
    };
    const recordSourceContact = (segmentId, ids, cumulative = false) => {
      const history = Array.isArray(state.sourceContactEvidence) ? state.sourceContactEvidence : [];
      if (history.some((entry) => entry.segment_id === segmentId)) return;
      state.sourceContactEvidence = [...history, {
        segment_id: segmentId,
        source_contact_mode: sourceContactMode,
        coverage_kind: cumulative ? 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION' : 'ACCEPTED_SOURCE_SEGMENT',
        kp_ids: [...ids],
        completed_at: new Date().toISOString(),
        source_hash: root.getAttribute('data-study-source-hash') || ''
      }];
    };''')
s=s.replace("      state.sourceContactDone = true;\n      state.learned", "      recordSourceContact(`block-cumulative:${objectId}`, kpData.map((kp) => kp.kpId), true);\n      state.sourceContactDone = true;\n      state.learned",1)
s=s.replace("      ids.forEach((id) => { learned[id] = true; });", "      recordSourceContact(`source:${group.groupId}`, ids);\n      ids.forEach((id) => { learned[id] = true; });",1)
s=s.replace("      if (state.stage !== 'kp_recall' || event.repeat) return;", "      if (root.dataset.xizongStateBlocked === 'true' || root.inert || state.stage !== 'kp_recall' || event.repeat) return;")
s=s.replace("    setKpIndex(state.kpIndex || 0); setStage(state.stage || 'block_learn'); syncState();\n  }", "    setKpIndex(state.kpIndex || 0); setStage(state.stage || 'block_learn'); syncState();\n   })();\n  }")
p.write_text(s)
p=r/'static-web/src/components/XizongRuntimeStageGuard.astro';s=p.read_text().replace("      if (!target) return;\n\n      const state", "      if (!target) return;\n      if (root.inert || root.dataset.xizongStateBlocked === 'true') { stop(event); return; }\n\n      const state",1);p.write_text(s)
p=r/'static-web/src/components/XizongLearnerObjectBridge.astro';s=p.read_text();s=s.replace("  if (root && payloadNode)","  if (root && !root.hasAttribute('data-xizong-state-blocked') && payloadNode)")
s=s.replace("      const sourceCompanionKp =",'''      const postlearnForGroup = (groupId) => {
        const slot = learner.slots?.logicGroupPostlearn?.[groupId] || {};
        let study = {};
        try { study = JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${root.getAttribute('data-study-object')}`) || '{}'); } catch {}
        const ids = groups.find((group) => group?.identity?.logicGroupId === groupId)?.kpIds || [];
        const closed = ids.length > 0 && ids.every((id) => study.learned?.[id] === true && study.ratings?.[id]);
        // POST_REVEAL extensions have explicit reveal timing; group precision and
        // outgoing connections are not moved earlier merely because a KP is revealed.
        return { extension: slot.extension || [], precision: closed ? slot.precision || [] : [], connection: closed ? slot.connection || [] : [] };
      };
      const sourceCompanionKp =''')
s=s.replace("recallAnswerVisible() ? learner.slots?.logicGroupPostlearn?.[groupId] || {} : {}", "recallAnswerVisible() ? postlearnForGroup(groupId) : {}")
p.write_text(s)
p=r/'static-web/src/components/XizongRecallEvidenceBridge.astro';s=p.read_text().replace('  if (root && bridge && kpPayload) {','  if (root && !root.hasAttribute(\'data-xizong-state-blocked\') && bridge && kpPayload) {\n   (() => {')
s=s.replace("    let kpIds = [];",'''    try {
      const raw = localStorage.getItem(evidenceKey);
      if (raw !== null) {
        const value = JSON.parse(raw);
        if (!value || typeof value !== 'object' || Array.isArray(value) || (value.evidenceHistory != null && !Array.isArray(value.evidenceHistory))) throw new Error('Invalid evidence');
      }
    } catch {
      root.dataset.xizongStateBlocked = 'true'; root.inert = true;
      const notice = document.createElement('p'); notice.setAttribute('role','alert');
      notice.textContent = 'Recall 历史无法安全读取，已保留原数据并暂停写入；请先备份再恢复。'; root.before(notice);
      return;
    }
    let kpIds = [];''')
s=s.replace("  }\n</script>","   })();\n  }\n</script>")
p.write_text(s)
p=r/'static-web/src/components/XizongSystemRepairReturn.astro';s=p.read_text()
a=s.index('      return raw.map((item)');b=s.index('\n    };',a)
s=s[:a]+'''      if (parsed?.system_id && parsed.system_id !== systemId) throw new Error('Wrong System');
      if (parsed?.schema) throw new Error('Typed Return is not supported by this legacy importer');
      if (!raw.length) return [];
      return raw.map((item) => {
        if (typeof item !== 'string' && (!item || typeof item !== 'object' || Array.isArray(item))) throw new Error('Malformed repair row');
        if (typeof item === 'object' && ['block_id','blockId','kp_id','kpId','target','target_kp_id'].some((key) => key in item)) throw new Error('Untrusted mapping');
        const row = typeof item === 'string' ? { questionId:item, reason:'', action:'', priority:'' } : {
          questionId:String(item.question_id || item.questionId || ''),
          reason:String(item.reason || item.why || ''), action:String(item.action || item.task || ''), priority:String(item.priority || '')
        };
        if (!allowed.has(row.questionId) || seen.has(row.questionId)) throw new Error('Unknown, stale, or duplicate W/U identity');
        if (row.priority && !['high','medium','low'].includes(row.priority)) throw new Error('Unknown priority');
        seen.add(row.questionId); return row;
      });''' + s[b:]
s=s.replace("      const byBlockKp = new Map();", "      const writes = [];\n      const byBlockKp = new Map();",1)
s=s.replace("        writeJson(inboxKey, {", "        writes.push([inboxKey, {",1).replace("          plans: [...withoutSameKp, plan]\n        });", "          plans: [...withoutSameKp, plan]\n        }]);",1)
s=s.replace("        writeJson(XIZONG_MEMORY_STORAGE_KEY, nextMemory);", "        writes.push([XIZONG_MEMORY_STORAGE_KEY, nextMemory]);",1)
s=s.replace("      }\n    };\n\n    const render =",'''      }
      writes.push([repairKey, { importedAt, plan: rows }]);
      const prior = writes.map(([key]) => [key, localStorage.getItem(key)]);
      try {
        for (const [key, value] of writes) {
          if (!writeJson(key, value)) throw new Error('Repair save failed');
        }
      } catch (error) {
        let rollbackFailed = false;
        for (const [key, value] of prior) {
          try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { rollbackFailed = true; }
        }
        if (rollbackFailed) throw new Error('REPAIR_ROLLBACK_INCOMPLETE');
        throw error;
      }
    };

    const render =''',1)
s=s.replace("        writeJson(repairKey, { importedAt: new Date().toISOString(), plan: rows });\n",'')
s=s.replace("      } catch {\n        if (status) status.textContent = '返回计划无法解析；没有改动任何学习状态。';", "      } catch (error) {\n        if (status) status.textContent = error?.message === 'REPAIR_ROLLBACK_INCOMPLETE' ? '导入失败且未能完整回滚，请先备份本机记录再恢复；不要继续重复导入。' : '返回计划无效、含非本轮 W/U 题号，或未能安全保存；未应用本次计划。';")
p.write_text(s)
print('source coverage and loss-safe restoration staged')
