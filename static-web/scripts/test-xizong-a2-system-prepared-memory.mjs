import { beforePromptCalibration, descriptorAtFrozenPackaging, assertReviewedA2Source, a2LearningBeforeModelReview, a2CuesBeforeOwnerReview, assertPreparedDescriptorAfterModelReview } from './xizong-calibration-test-support.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
// Frozen oracle reconstructed independently from reviewed Current/proposals before integration.
// This is test evidence only, never a runtime admission registry.
export const root=process.env.KIANOS_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const out=process.env.KIANOS_QA_DIR || path.join(root,'static-web/.qa');fs.mkdirSync(out,{recursive:true});
process.env.KIANOS_REPO_ROOT=root;process.env.KIANOS_XIZONG_BUILD_CACHE='1';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const mod=n=>import(pathToFileURL(`${root}/static-web/src/lib/${n}.mjs`));
export const native=await mod('xizong'),production=await mod('xizongProductionProjection'),cues=await mod('xizongLearningCues'),learner=await mod('xizongLearnerObject'),release=await mod('xizongMemoryRelease'),memory=await mod('xizongMemoryModel'),revision=await mod('xizongRevisionWitness'),repr=await mod('xizongRepresentationGate'),auto=await mod('xizongMemoryAutoRelease'),compiler=await mod('xizongLearnerProjection');
export const oracle={
  "basis": "Frozen independently reviewed Current/proposals; not generated integration totals",
  "frozen_main": "ce079966ebce7a95fe9a58b174a412f9f033fd3b",
  "original_index": {
    "schema": "kianos.xizong.learning_cues.v1",
    "status": "CURRENT",
    "authority": "CHAT_APPROVED",
    "system_id": "respiratory",
    "canonical_id": "A2",
    "system_owner": "content/xizong/knowledge/systems/a2-respiratory/system.json",
    "medical_core_owner": "content/xizong/knowledge/systems/a2-respiratory/blocks/",
    "learning_support": "content/xizong/knowledge/learner/a2-respiratory-learning.json",
    "role": "SELECTIVE_PRECISION_AND_VISUAL_TRIGGER_INDEX_ONLY",
    "rules": {
      "no_second_owner": "Cues may identify what must eventually be recalled exactly and when a source visual is worth opening. They must not copy or replace the canonical medical answer.",
      "precision_selection": "SELECTIVE_HIGH_VALUE_INDEX_NOT_EXHAUSTIVE",
      "precision_absence": "A KP or fact not indexed here is not downgraded, omitted or declared unimportant; canonical Block/KP coverage remains lossless and authoritative.",
      "first_pass": "Precision cues are nonblocking awareness only during first pass. They do not create a separate first-pass drill queue.",
      "visual_behavior": "Show the source visual at the relevant learning moment with one micro-task, then continue. No completion ceremony or image rating.",
      "source_truth": "Exact values, drug names, classifications and visual meaning remain in canonical Block/KP content and the referenced Lecture source."
    },
    "precision_index": [
      {
        "id": "a2-r01-kp01-precision",
        "anchor": {
          "block_id": "respiratory-r01",
          "kp_id": "respiratory-r01-kp01"
        },
        "cue": "肺容积 / 肺容量的常用数值与组合公式最终需要精确恢复。"
      },
      {
        "id": "a2-r01-kp02-precision",
        "anchor": {
          "block_id": "respiratory-r01",
          "kp_id": "respiratory-r01-kp02"
        },
        "cue": "FEV1–3 的百分比与一秒率相关数字最终需要精确恢复。"
      },
      {
        "id": "a2-r02-kp03-precision",
        "anchor": {
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp03"
        },
        "cue": "全肺平均、肺尖与肺底 VA/Q 的数值最终需要精确恢复。"
      },
      {
        "id": "a2-r02-lg04-precision",
        "anchor": {
          "block_id": "respiratory-r02",
          "logic_group_id": "respiratory-r02-lg04"
        },
        "cue": "P50、Hb 氧容量与氧解离曲线的关键数字 / 移动边界最终需要精确恢复。"
      },
      {
        "id": "a2-r03-lg03-precision",
        "anchor": {
          "block_id": "respiratory-r03",
          "logic_group_id": "respiratory-r03-lg03"
        },
        "cue": "持续气流受限的诊断边界与 GOLD 严重度数字最终需要精确恢复。"
      },
      {
        "id": "a2-r03-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r03",
          "logic_group_id": "respiratory-r03-lg05"
        },
        "cue": "长期家庭氧疗与 AECOPD 的关键阈值 / 用药边界最终需要精确恢复。"
      },
      {
        "id": "a2-r04-lg03-precision",
        "anchor": {
          "block_id": "respiratory-r04",
          "logic_group_id": "respiratory-r04-lg03"
        },
        "cue": "舒张试验、激发试验与 PEF / FeNO 等客观证据的精确阈值最终需要恢复。"
      },
      {
        "id": "a2-r04-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r04",
          "logic_group_id": "respiratory-r04-lg05"
        },
        "cue": "急性发作严重度分级中的关键数值边界最终需要精确恢复。"
      },
      {
        "id": "a2-r05-lg01-precision",
        "anchor": {
          "block_id": "respiratory-r05",
          "logic_group_id": "respiratory-r05-lg01"
        },
        "cue": "CAP / HAP 时间边界与 CURB-65 五项阈值最终需要精确恢复。"
      },
      {
        "id": "a2-r05-lg03-precision",
        "anchor": {
          "block_id": "respiratory-r05",
          "logic_group_id": "respiratory-r05-lg03"
        },
        "cue": "高频病原—治疗药物的精确配对按当前 Study 口径最终需要稳定。"
      },
      {
        "id": "a2-r06-lg02-precision",
        "anchor": {
          "block_id": "respiratory-r06",
          "logic_group_id": "respiratory-r06-lg02"
        },
        "cue": "大咯血数值边界与止血药禁忌最终需要精确恢复。"
      },
      {
        "id": "a2-r06-lg03-precision",
        "anchor": {
          "block_id": "respiratory-r06",
          "logic_group_id": "respiratory-r06-lg03"
        },
        "cue": "误吸体位对应肺段与关键抗感染配对最终需要精确恢复。"
      },
      {
        "id": "a2-r07-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r07",
          "logic_group_id": "respiratory-r07-lg05"
        },
        "cue": "PPD、痰涂片等阈值及活动性 / 传染性证据边界最终需要精确恢复。"
      },
      {
        "id": "a2-r07-lg06-precision",
        "anchor": {
          "block_id": "respiratory-r07",
          "logic_group_id": "respiratory-r07-lg06"
        },
        "cue": "初治方案、核心药不良反应与 RR/MDR 组别 / 疗程最终需要精确恢复。"
      },
      {
        "id": "a2-r08-lg03-precision",
        "anchor": {
          "block_id": "respiratory-r08",
          "logic_group_id": "respiratory-r08-lg03"
        },
        "cue": "结节病分期的精确影像组合最终需要精确恢复。"
      },
      {
        "id": "a2-r08-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r08",
          "logic_group_id": "respiratory-r08-lg05"
        },
        "cue": "SiO₂ 粒径、硅肺分期与低频影像数字最终需要精确恢复。"
      },
      {
        "id": "a2-r09-kp18-precision",
        "anchor": {
          "block_id": "respiratory-r09",
          "kp_id": "respiratory-r09-kp18"
        },
        "cue": "D-dimer 阈值、血气方向与 ECG 右心征中的精确数字最终需要恢复。"
      },
      {
        "id": "a2-r09-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r09",
          "logic_group_id": "respiratory-r09-lg05"
        },
        "cue": "PE 危险分层、溶栓时间窗与抗凝疗程边界最终需要精确恢复。"
      },
      {
        "id": "a2-r10-kp02-precision",
        "anchor": {
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp02"
        },
        "cue": "进行性血胸的持续引流阈值与判定数字最终需要精确恢复。"
      },
      {
        "id": "a2-r10-kp04-precision",
        "anchor": {
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp04"
        },
        "cue": "胸水化验比值、梯度与 Light 判定边界最终需要精确恢复。"
      },
      {
        "id": "a2-r10-kp08-precision",
        "anchor": {
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp08"
        },
        "cue": "胸穿首次 / 后续容量、频率与相关边界最终需要精确恢复。"
      },
      {
        "id": "a2-r10-kp16-precision",
        "anchor": {
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp16"
        },
        "cue": "闭合性气胸压缩比例与观察 / 抽气边界最终需要精确恢复。"
      },
      {
        "id": "a2-r10-kp19-precision",
        "anchor": {
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp19"
        },
        "cue": "胸管位置、插拔呼吸时相与拔管组合最终需要精确恢复。"
      },
      {
        "id": "a2-r11-kp21-precision",
        "anchor": {
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp21"
        },
        "cue": "T 分期的三个直径边界与等号归属最终需要精确恢复。"
      },
      {
        "id": "a2-r11-kp22-precision",
        "anchor": {
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp22"
        },
        "cue": "N / M 分层的空间边界与 M1 细分最终需要精确恢复。"
      },
      {
        "id": "a2-r11-lg05-precision",
        "anchor": {
          "block_id": "respiratory-r11",
          "logic_group_id": "respiratory-r11-lg05"
        },
        "cue": "靶点—药物配对与 SCLC / NSCLC 治疗边界最终需要稳定精确。"
      },
      {
        "id": "a2-r12-kp08-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp08"
        },
        "cue": "P/F 定义与三档分度最终需要精确恢复。"
      },
      {
        "id": "a2-r12-kp09-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp09"
        },
        "cue": "PAWP 鉴别阈值与可并存边界最终需要精确恢复。"
      },
      {
        "id": "a2-r12-kp12-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp12"
        },
        "cue": "PEEP 起始 / 目标范围与容量门槛最终需要精确恢复。"
      },
      {
        "id": "a2-r12-kp13-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp13"
        },
        "cue": "潮气量、平台压、允许性高碳酸血症与 pH 范围最终需要精确恢复。"
      },
      {
        "id": "a2-r12-kp16-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp16"
        },
        "cue": "Ⅰ / Ⅱ型呼衰的血气边界最终需要精确恢复。"
      },
      {
        "id": "a2-r12-kp17-precision",
        "anchor": {
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp17"
        },
        "cue": "慢性Ⅱ型呼衰氧疗浓度边界与急性哮喘例外最终需要精确恢复。"
      }
    ],
    "visual_bindings": [
      {
        "id": "a2-r01-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r01",
          "logic_group_id": "respiratory-r01-lg01"
        },
        "source_locator": "生理 Lecture PDF P169–170",
        "task": "沿肺容积 / 容量拼图走一遍，并指出 FVC / FEV 图里‘量’和‘速度’分别在哪里。"
      },
      {
        "id": "a2-r01-lg04-visual",
        "anchor": {
          "block_id": "respiratory-r01",
          "logic_group_id": "respiratory-r01-lg04"
        },
        "source_locator": "生理 Lecture PDF P170–173",
        "task": "只比较阻塞 vs 限制的流速轴、容量轴和残气方向，不背整张表。"
      },
      {
        "id": "a2-r02-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r02",
          "logic_group_id": "respiratory-r02-lg01"
        },
        "source_locator": "生理 Lecture PDF P186–187",
        "task": "沿呼吸膜从肺泡侧走到毛细血管侧一次，区分‘变厚’和‘面积减少’两种故障。"
      },
      {
        "id": "a2-r02-lg02-visual",
        "anchor": {
          "block_id": "respiratory-r02",
          "logic_group_id": "respiratory-r02-lg02"
        },
        "source_locator": "生理 Lecture PDF P187–188",
        "task": "看肺尖 / 肺底图，只回答哪里更像死腔、哪里更像分流，以及为什么。"
      },
      {
        "id": "a2-r03-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r03",
          "logic_group_id": "respiratory-r03-lg01"
        },
        "source_locator": "病理 Lecture PDF P54–64",
        "task": "在气道树 / 肺腺泡和慢支病理图上分清‘管’与‘泡’各自坏在哪里。"
      },
      {
        "id": "a2-r04-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r04",
          "logic_group_id": "respiratory-r04-lg01"
        },
        "source_locator": "内科 Lecture PDF P47",
        "task": "沿炎症细胞—神经调节—平滑肌反应走一遍，只抓促收缩与促舒张的方向。"
      },
      {
        "id": "a2-r05-lg02-visual",
        "anchor": {
          "block_id": "respiratory-r05",
          "logic_group_id": "respiratory-r05-lg02"
        },
        "source_locator": "内科 Lecture PDF P33–35",
        "task": "对着病变范围和影像，把大叶、小叶、间质三种空间各指认一次。"
      },
      {
        "id": "a2-r06-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r06",
          "logic_group_id": "respiratory-r06-lg01"
        },
        "source_locator": "病理 Lecture PDF P66–67",
        "task": "在支气管壁支撑结构图上找到‘为什么能永久扩张’，再与肺气肿的末梢肺组织损伤对照。"
      },
      {
        "id": "a2-r07-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r07",
          "logic_group_id": "respiratory-r07-lg01"
        },
        "source_locator": "病理 Lecture PDF P110–111",
        "task": "沿结核结节从中心到外周走一遍，确认坏死、上皮样细胞 / 巨细胞和淋巴细胞的位置关系。"
      },
      {
        "id": "a2-r07-lg02-visual",
        "anchor": {
          "block_id": "respiratory-r07",
          "logic_group_id": "respiratory-r07-lg02"
        },
        "source_locator": "病理 Lecture PDF P111",
        "task": "沿原发复合征三部分走一遍，再说出为什么这张图能解释淋巴 / 血道播散倾向。"
      },
      {
        "id": "a2-r08-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r08",
          "logic_group_id": "respiratory-r08-lg01"
        },
        "source_locator": "内科 Lecture PDF P22",
        "task": "在阻塞 / 限制肺功能表上只抓容量、比值和 DLCO 三条轴。"
      },
      {
        "id": "a2-r08-lg02-visual",
        "anchor": {
          "block_id": "respiratory-r08",
          "logic_group_id": "respiratory-r08-lg02"
        },
        "source_locator": "内科 Lecture PDF P22、P25–26",
        "task": "看 IPF HRCT，只抓分布：外带 / 胸膜下 / 基底，以及网格—蜂窝—牵拉支扩的关系。"
      },
      {
        "id": "a2-r09-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r09",
          "logic_group_id": "respiratory-r09-lg01"
        },
        "source_locator": "病理 Lecture PDF P65–66",
        "task": "先看肺小动脉重构，再看右室形态；沿 PVR↑ 把血管变化和右室适应接起来。"
      },
      {
        "id": "a2-r10-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r10",
          "logic_group_id": "respiratory-r10-lg01"
        },
        "source_locator": "内科 Lecture PDF P67–68",
        "task": "沿胸水形成机制和 Light 表走一次：先判动力学来源，再判渗出 / 漏出。"
      },
      {
        "id": "a2-r10-lg02-visual",
        "anchor": {
          "block_id": "respiratory-r10",
          "logic_group_id": "respiratory-r10-lg02"
        },
        "source_locator": "内科 Lecture PDF P68–69",
        "task": "在胸水体征和影像上同时找‘液体占位’与‘纵隔方向’两件事。"
      },
      {
        "id": "a2-r11-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r11",
          "logic_group_id": "respiratory-r11-lg01"
        },
        "source_locator": "病理 Lecture PDF P75–76",
        "task": "先按中央 / 周围 / 弥漫定位，再分别看腺癌、鳞癌、小细胞的形态，不把位置与组织类型混成一个坐标。"
      },
      {
        "id": "a2-r12-lg01-visual",
        "anchor": {
          "block_id": "respiratory-r12",
          "logic_group_id": "respiratory-r12-lg01"
        },
        "source_locator": "内科 Lecture PDF P54",
        "task": "沿内皮损伤和Ⅱ型肺泡上皮损伤两条支路各走一遍，找到它们最后在哪里汇合成顽固低氧。"
      }
    ]
  },
  "all_cues": [
    {
      "id": "a2-r01-kp01-precision",
      "anchor": {
        "block_id": "respiratory-r01",
        "kp_id": "respiratory-r01-kp01"
      },
      "cue": "肺容积 / 肺容量的常用数值与组合公式最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r01-kp01"
      ]
    },
    {
      "id": "a2-r01-kp02-precision",
      "anchor": {
        "block_id": "respiratory-r01",
        "kp_id": "respiratory-r01-kp02"
      },
      "cue": "FEV1–3 的百分比与一秒率相关数字最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r01-kp02"
      ]
    },
    {
      "id": "a2-r02-kp03-precision",
      "anchor": {
        "block_id": "respiratory-r02",
        "kp_id": "respiratory-r02-kp03"
      },
      "cue": "全肺平均、肺尖与肺底 VA/Q 的数值最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r02-kp03"
      ]
    },
    {
      "id": "a2-r02-lg04-precision",
      "anchor": {
        "block_id": "respiratory-r02",
        "logic_group_id": "respiratory-r02-lg04"
      },
      "cue": "P50、Hb 氧容量与氧解离曲线的关键数字 / 移动边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r02-kp07",
        "respiratory-r02-kp08",
        "respiratory-r02-kp09",
        "respiratory-r02-kp10",
        "respiratory-r02-kp11"
      ]
    },
    {
      "id": "a2-r03-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r03",
        "logic_group_id": "respiratory-r03-lg03"
      },
      "cue": "持续气流受限的诊断边界与 GOLD 严重度数字最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r03-kp09",
        "respiratory-r03-kp10",
        "respiratory-r03-kp11"
      ]
    },
    {
      "id": "a2-r03-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r03",
        "logic_group_id": "respiratory-r03-lg05"
      },
      "cue": "长期家庭氧疗与 AECOPD 的关键阈值 / 用药边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r03-kp16",
        "respiratory-r03-kp17",
        "respiratory-r03-kp18",
        "respiratory-r03-kp19",
        "respiratory-r03-kp20"
      ]
    },
    {
      "id": "a2-r04-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r04",
        "logic_group_id": "respiratory-r04-lg03"
      },
      "cue": "舒张试验、激发试验与 PEF / FeNO 等客观证据的精确阈值最终需要恢复。",
      "original_member_kp_ids": [
        "respiratory-r04-kp06",
        "respiratory-r04-kp07",
        "respiratory-r04-kp08",
        "respiratory-r04-kp09"
      ]
    },
    {
      "id": "a2-r04-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r04",
        "logic_group_id": "respiratory-r04-lg05"
      },
      "cue": "急性发作严重度分级中的关键数值边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r04-kp15",
        "respiratory-r04-kp16",
        "respiratory-r04-kp17"
      ]
    },
    {
      "id": "a2-r05-lg01-precision",
      "anchor": {
        "block_id": "respiratory-r05",
        "logic_group_id": "respiratory-r05-lg01"
      },
      "cue": "CAP / HAP 时间边界与 CURB-65 五项阈值最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r05-kp01",
        "respiratory-r05-kp02",
        "respiratory-r05-kp03",
        "respiratory-r05-kp04"
      ]
    },
    {
      "id": "a2-r05-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r05",
        "logic_group_id": "respiratory-r05-lg03"
      },
      "cue": "高频病原—治疗药物的精确配对按当前 Study 口径最终需要稳定。",
      "original_member_kp_ids": [
        "respiratory-r05-kp09",
        "respiratory-r05-kp10",
        "respiratory-r05-kp11",
        "respiratory-r05-kp12",
        "respiratory-r05-kp13",
        "respiratory-r05-kp14"
      ]
    },
    {
      "id": "a2-r06-lg02-precision",
      "anchor": {
        "block_id": "respiratory-r06",
        "logic_group_id": "respiratory-r06-lg02"
      },
      "cue": "大咯血数值边界与止血药禁忌最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r06-kp07",
        "respiratory-r06-kp08",
        "respiratory-r06-kp09",
        "respiratory-r06-kp10"
      ]
    },
    {
      "id": "a2-r06-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r06",
        "logic_group_id": "respiratory-r06-lg03"
      },
      "cue": "误吸体位对应肺段与关键抗感染配对最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r06-kp11",
        "respiratory-r06-kp12",
        "respiratory-r06-kp13",
        "respiratory-r06-kp14",
        "respiratory-r06-kp15"
      ]
    },
    {
      "id": "a2-r07-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r07",
        "logic_group_id": "respiratory-r07-lg05"
      },
      "cue": "PPD、痰涂片等阈值及活动性 / 传染性证据边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r07-kp17",
        "respiratory-r07-kp18",
        "respiratory-r07-kp19"
      ]
    },
    {
      "id": "a2-r07-lg06-precision",
      "anchor": {
        "block_id": "respiratory-r07",
        "logic_group_id": "respiratory-r07-lg06"
      },
      "cue": "初治方案、核心药不良反应与 RR/MDR 组别 / 疗程最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r07-kp20",
        "respiratory-r07-kp21",
        "respiratory-r07-kp22",
        "respiratory-r07-kp23",
        "respiratory-r07-kp24"
      ]
    },
    {
      "id": "a2-r08-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r08",
        "logic_group_id": "respiratory-r08-lg03"
      },
      "cue": "结节病分期的精确影像组合最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r08-kp07",
        "respiratory-r08-kp08",
        "respiratory-r08-kp09"
      ]
    },
    {
      "id": "a2-r08-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r08",
        "logic_group_id": "respiratory-r08-lg05"
      },
      "cue": "SiO₂ 粒径、硅肺分期与低频影像数字最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r08-kp13",
        "respiratory-r08-kp14",
        "respiratory-r08-kp15",
        "respiratory-r08-kp16"
      ]
    },
    {
      "id": "a2-r09-kp18-precision",
      "anchor": {
        "block_id": "respiratory-r09",
        "kp_id": "respiratory-r09-kp18"
      },
      "cue": "D-dimer 阈值、血气方向与 ECG 右心征中的精确数字最终需要恢复。",
      "original_member_kp_ids": [
        "respiratory-r09-kp18"
      ]
    },
    {
      "id": "a2-r09-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r09",
        "logic_group_id": "respiratory-r09-lg05"
      },
      "cue": "PE 危险分层、溶栓时间窗与抗凝疗程边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r09-kp20",
        "respiratory-r09-kp21",
        "respiratory-r09-kp22"
      ]
    },
    {
      "id": "a2-r10-kp02-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp02"
      },
      "cue": "进行性血胸的持续引流阈值与判定数字最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r10-kp02"
      ]
    },
    {
      "id": "a2-r10-kp04-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp04"
      },
      "cue": "胸水化验比值、梯度与 Light 判定边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r10-kp04"
      ]
    },
    {
      "id": "a2-r10-kp08-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp08"
      },
      "cue": "胸穿首次 / 后续容量、频率与相关边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r10-kp08"
      ]
    },
    {
      "id": "a2-r10-kp16-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp16"
      },
      "cue": "闭合性气胸压缩比例与观察 / 抽气边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r10-kp16"
      ]
    },
    {
      "id": "a2-r10-kp19-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp19"
      },
      "cue": "胸管位置、插拔呼吸时相与拔管组合最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r10-kp19"
      ]
    },
    {
      "id": "a2-r11-kp21-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "kp_id": "respiratory-r11-kp21"
      },
      "cue": "T 分期的三个直径边界与等号归属最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r11-kp21"
      ]
    },
    {
      "id": "a2-r11-kp22-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "kp_id": "respiratory-r11-kp22"
      },
      "cue": "N / M 分层的空间边界与 M1 细分最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r11-kp22"
      ]
    },
    {
      "id": "a2-r11-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "logic_group_id": "respiratory-r11-lg05"
      },
      "cue": "靶点—药物配对与 SCLC / NSCLC 治疗边界最终需要稳定精确。",
      "original_member_kp_ids": [
        "respiratory-r11-kp19",
        "respiratory-r11-kp20",
        "respiratory-r11-kp21",
        "respiratory-r11-kp22"
      ]
    },
    {
      "id": "a2-r12-kp08-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp08"
      },
      "cue": "P/F 定义与三档分度最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp08"
      ]
    },
    {
      "id": "a2-r12-kp09-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp09"
      },
      "cue": "PAWP 鉴别阈值与可并存边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp09"
      ]
    },
    {
      "id": "a2-r12-kp12-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp12"
      },
      "cue": "PEEP 起始 / 目标范围与容量门槛最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp12"
      ]
    },
    {
      "id": "a2-r12-kp13-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp13"
      },
      "cue": "潮气量、平台压、允许性高碳酸血症与 pH 范围最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp13"
      ]
    },
    {
      "id": "a2-r12-kp16-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp16"
      },
      "cue": "Ⅰ / Ⅱ型呼衰的血气边界最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp16"
      ]
    },
    {
      "id": "a2-r12-kp17-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp17"
      },
      "cue": "慢性Ⅱ型呼衰氧疗浓度边界与急性哮喘例外最终需要精确恢复。",
      "original_member_kp_ids": [
        "respiratory-r12-kp17"
      ]
    }
  ],
  "accepted": [
    {
      "id": "a2-r01-kp01-precision",
      "anchor": {
        "block_id": "respiratory-r01",
        "kp_id": "respiratory-r01-kp01"
      },
      "cue": "肺容积 / 肺容量的常用数值与组合公式最终需要精确恢复。",
      "members": [
        "respiratory-r01-kp01"
      ],
      "answer": "先用平静呼吸两端拼四个容积，再组合四个容量。\n- VT/TV：每次平静吸入或呼出的气体量，约500 mL。\n- IRV：平静吸气末再用力吸入的量。\n- ERV：平静呼气末再用力呼出的量。\n- RV：最大呼气末仍在肺内、不能呼出的量。\n- IC：平静呼气末用力吸到最大所吸入的量；IC＝VT＋IRV。\n- FRC：平静呼气末留肺内的量；FRC＝ERV＋RV，约2500 mL。\n- VC：用力吸气后再用力呼气所能呼出的最大量；VC＝VT＋IRV＋ERV。\n- TLC：肺能容纳的最大气量；TLC＝VC＋RV。\n气体缓冲：正常解剖无效腔约150 mL，每口真正进入肺泡的新鲜气约500−150＝350 mL；相对FRC约2500 mL，每口更新约1/7，缓冲肺泡气分压波动。",
      "required_visible_text": [
        "先用平静呼吸两端拼四个容积，再组合四个容量。\n- VT/TV：每次平静吸入或呼出的气体量，约500 mL。\n- IRV：平静吸气末再用力吸入的量。\n- ERV：平静呼气末再用力呼出的量。\n- RV：最大呼气末仍在肺内、不能呼出的量。\n- IC：平静呼气末用力吸到最大所吸入的量；IC＝VT＋IRV。\n- FRC：平静呼气末留肺内的量；FRC＝ERV＋RV，约2500 mL。\n- VC：用力吸气后再用力呼气所能呼出的最大量；VC＝VT＋IRV＋ERV。\n- TLC：肺能容纳的最大气量；TLC＝VC＋RV。\n气体缓冲：正常解剖无效腔约150 mL，每口真正进入肺泡的新鲜气约500−150＝350 mL；相对FRC约2500 mL，每口更新约1/7，缓冲肺泡气分压波动。",
        "现有KP01容量/组合与明确常用近似数值；不扩成R1所有数值卡。",
        "数值属于本节Study的典型近似值，不能当所有人的实测值。",
        "RV定位最大呼气末；FRC定位平静呼气末且包括ERV，不可互换。",
        "Current没有给IRV/ERV/RV各自通用数值，也未给正常呼吸频率数值；答案只恢复本意图现有明确数值，MI-D的频率缺口单列Source/HOLD。",
        "正常肺泡无效腔很小，150 mL计算按解剖无效腔；PE使肺泡无效腔增加时不能仍把生理无效腔一律等于150。",
        "四容积按“平静一口、上储备、下储备、尽呼余量”定位；四容量按IC/VC是可移动范围、FRC/TLC含RV复原。先定呼气末，再写加法；350÷2500解释气池，不独背1/7。",
        "Current KP01容量拼图/气体缓冲池与KP04无效腔条件；非新增医学口诀。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r01",
          "kp_id": "respiratory-r01-kp01",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r01",
          "kp_id": "respiratory-r01-kp04",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r01-kp02-precision",
      "anchor": {
        "block_id": "respiratory-r01",
        "kp_id": "respiratory-r01-kp02"
      },
      "cue": "FEV1–3 的百分比与一秒率相关数字最终需要精确恢复。",
      "members": [
        "respiratory-r01-kp02"
      ],
      "answer": "课程时间肺活量：开始用力呼气后的1、2、3秒呼出量分别是FEV1、FEV2、FEV3；与FVC相比约83%、96%、99%。\nFEV1/FVC是一秒率，分母为本次FVC，主要回答相对流速是否受限。FEV1%pred以预计FEV1作分母，回答气流受限严重程度，两者不能互换。\nVC强调最大可动气量，FVC额外要求用力并尽快呼气；小气道动态提前关闭时FVC可小于SVC，正常或无明显动态压缩时可接近，不把VC>FVC写成每次必然。\n后续COPD的支扩剂后FEV1/FVC<70%是持续气流受限的重要入口，不是本节正常83%的另一写法；必须结合暴露、症状及其他病因，不能单数值确诊。",
      "required_visible_text": [
        "课程时间肺活量：开始用力呼气后的1、2、3秒呼出量分别是FEV1、FEV2、FEV3；与FVC相比约83%、96%、99%。\nFEV1/FVC是一秒率，分母为本次FVC，主要回答相对流速是否受限。FEV1%pred以预计FEV1作分母，回答气流受限严重程度，两者不能互换。\nVC强调最大可动气量，FVC额外要求用力并尽快呼气；小气道动态提前关闭时FVC可小于SVC，正常或无明显动态压缩时可接近，不把VC>FVC写成每次必然。\n后续COPD的支扩剂后FEV1/FVC<70%是持续气流受限的重要入口，不是本节正常83%的另一写法；必须结合暴露、症状及其他病因，不能单数值确诊。",
        "现有KP02百分比/分母身份；疾病阈值只作既有接口，不扩为COPD完整分级卡。",
        "83/96/99是当前生理Study近似比例，不是GOLD严重度级别。",
        "FEV1/FVC与FEV1%pred的分母不同。",
        "<70%保留支扩后条件；并非COPD独有，疾病诊断正式由R3承担。",
        "沿同一次用力呼气的1→2→3秒，把83→96→99放在同一时间轴；再问分母是“本次FVC”还是“预计FEV1”。",
        "Current KP02数值/指标职责；没有发明新数值口诀。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r01",
          "kp_id": "respiratory-r01-kp02",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp06",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r02-kp03-precision",
      "anchor": {
        "block_id": "respiratory-r02",
        "kp_id": "respiratory-r02-kp03"
      },
      "cue": "全肺平均、肺尖与肺底 VA/Q 的数值最终需要精确恢复。",
      "members": [
        "respiratory-r02-kp03"
      ],
      "answer": "VA/Q＝肺泡通气量÷每分钟肺血流量；肺血流量约等于右室心输出量。\n本节Study：全肺平均约0.84；直立位肺尖约3.3，肺底约0.63。重力使通气和血流都改变，血流变化更明显，所以肺尖相对血少、比值高；肺底相对通气少、比值低。\n高VA/Q：气相对多/血少，肺泡气体无人交换→肺泡无效腔增加→死腔样；接口PE、DIC、肺气肿毛细床减少。\n低VA/Q：气少/血相对多，静脉血流经未充分通气肺泡→功能性短路/分流样；接口哮喘、纤维化、肺炎、肺不张、ARDS。",
      "required_visible_text": [
        "VA/Q＝肺泡通气量÷每分钟肺血流量；肺血流量约等于右室心输出量。\n本节Study：全肺平均约0.84；直立位肺尖约3.3，肺底约0.63。重力使通气和血流都改变，血流变化更明显，所以肺尖相对血少、比值高；肺底相对通气少、比值低。\n高VA/Q：气相对多/血少，肺泡气体无人交换→肺泡无效腔增加→死腔样；接口PE、DIC、肺气肿毛细床减少。\n低VA/Q：气少/血相对多，静脉血流经未充分通气肺泡→功能性短路/分流样；接口哮喘、纤维化、肺炎、肺不张、ARDS。",
        "既有KP03数值与两方向；不拆为三个新数值卡。",
        "0.84是全肺平均，不能把生理性肺尖/肺底偏离都当病变。",
        "功能性分流不等于另有真实解剖通道。",
        "相对高低是气与血匹配轴；同一COPD肺可同时有低V/Q和高V/Q区域。",
        "Current已有“大大”：比值大→肺泡无效腔大；“短小”：功能性动静脉短路→比值小。数字按“全肺中间、尖高底低”归位，先问是气少还是血少。",
        "Current KP03“大大/短小”与肺尖/肺底机制。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp03",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp04",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r02-lg04-precision",
      "anchor": {
        "block_id": "respiratory-r02",
        "logic_group_id": "respiratory-r02-lg04"
      },
      "cue": "P50、Hb 氧容量与氧解离曲线的关键数字 / 移动边界最终需要精确恢复。",
      "members": [
        "respiratory-r02-kp07",
        "respiratory-r02-kp08",
        "respiratory-r02-kp09",
        "respiratory-r02-kp10",
        "respiratory-r02-kp11"
      ],
      "answer": "先分“载体最多装多少”与“给定氧分压抓得多紧”。\n容量/含量/饱和度：1 g Hb最多约结合1.34 mL O₂；Hb约15 g/100 mL时氧容量约20.1 mL/100 mL。氧含量是溶解＋结合氧；正常Hb的SaO₂只以实际结合氧/最大可结合氧计算，不用总CaO₂作分子。正常动脉SaO₂约97%；约98.5%的O₂用Hb结合形式运输。COHb/MetHb时分清功能性/分数饱和度并用共氧测定。\n曲线数字：上段PO₂ 60–100 mmHg平坦，PaO₂≥60时SaO₂通常≥90%，利肺装氧；中段40–60较陡，利安静组织卸氧；下段15–40最陡，利高代谢卸氧。P50＝Hb饱和50%时PO₂，约26.5 mmHg。T型亲和低、R型高，亚基协同形成S形。\n移动：温度↑、PCO₂↑、H⁺↑/pH↓、2,3-DPG↑→P50↑、右移、亲和↓、易卸氧；反向以及CO中毒→左移、P50↓、亲和↑、难卸氧。库存血2,3-DPG维持受损，不等于细胞代谢绝对停止。低温同时降低耗氧并左移；不当补碱可妨碍卸氧，不能把生理串联直接变成治疗决定。\n效应分组：波尔“酸度→O₂亲和”；霍尔丹“Hb氧合→CO₂/H⁺携带”。组织卸O₂、装CO₂，肺内反向。\n携氧/利用边界：CO与Hb亲和本节约为O₂的250倍，既减少可结合位点又使余位点左移；PaO₂/普通SpO₂正常不能排除，CO的PvO₂非固定方向。发绀看去氧Hb绝对量≥50 g/L（5 g/100 mL），不等于组织缺氧：肺通气/换气失败常PaO₂与含量↓；严重贫血PaO₂可正常、含量↓且不绀；CO亦可不绀，樱桃红非人人典型；氰化物主要不能利用O₂，PaO₂/含量按本节表可正常而PvO₂↑。\nCO救治仅继承Current接口：脱离暴露、100%氧，按神经/心脏表现、酸中毒及暴露条件评高压氧；旧“加5%CO₂”不能当常规操作。",
      "required_visible_text": [
        "先分“载体最多装多少”与“给定氧分压抓得多紧”。\n容量/含量/饱和度：1 g Hb最多约结合1.34 mL O₂；Hb约15 g/100 mL时氧容量约20.1 mL/100 mL。氧含量是溶解＋结合氧；正常Hb的SaO₂只以实际结合氧/最大可结合氧计算，不用总CaO₂作分子。正常动脉SaO₂约97%；约98.5%的O₂用Hb结合形式运输。COHb/MetHb时分清功能性/分数饱和度并用共氧测定。\n曲线数字：上段PO₂ 60–100 mmHg平坦，PaO₂≥60时SaO₂通常≥90%，利肺装氧；中段40–60较陡，利安静组织卸氧；下段15–40最陡，利高代谢卸氧。P50＝Hb饱和50%时PO₂，约26.5 mmHg。T型亲和低、R型高，亚基协同形成S形。\n移动：温度↑、PCO₂↑、H⁺↑/pH↓、2,3-DPG↑→P50↑、右移、亲和↓、易卸氧；反向以及CO中毒→左移、P50↓、亲和↑、难卸氧。库存血2,3-DPG维持受损，不等于细胞代谢绝对停止。低温同时降低耗氧并左移；不当补碱可妨碍卸氧，不能把生理串联直接变成治疗决定。\n效应分组：波尔“酸度→O₂亲和”；霍尔丹“Hb氧合→CO₂/H⁺携带”。组织卸O₂、装CO₂，肺内反向。\n携氧/利用边界：CO与Hb亲和本节约为O₂的250倍，既减少可结合位点又使余位点左移；PaO₂/普通SpO₂正常不能排除，CO的PvO₂非固定方向。发绀看去氧Hb绝对量≥50 g/L（5 g/100 mL），不等于组织缺氧：肺通气/换气失败常PaO₂与含量↓；严重贫血PaO₂可正常、含量↓且不绀；CO亦可不绀，樱桃红非人人典型；氰化物主要不能利用O₂，PaO₂/含量按本节表可正常而PvO₂↑。\nCO救治仅继承Current接口：脱离暴露、100%氧，按神经/心脏表现、酸中毒及暴露条件评高压氧；旧“加5%CO₂”不能当常规操作。",
        "原LG04的P50/Hb容量/曲线精度与完整鉴别条件，保留5个原成员＋额外容量owner。",
        "原LG07–11全成员保留；容量来自额外KP05，不能为方便把LG改锚KP07。",
        "曲线上段原题PaCO₂≥60为符号冲突，Current讨论PaO₂≥60；不把高碳酸设成氧合目标。",
        "氧容量1.34×Hb不是完整氧供；PaO₂、SaO₂、Hb与CaO₂不可互换。",
        "CO的PvO₂不得固定写↓；普通SpO₂可能误导，按共氧证据。",
        "库存血、低温、酸碱和中毒只留机制/已审治疗接口；完整决策归既有外部owner。",
        "保留“上坡缓，下坡陡”和“增高右移”。把60/90放装氧安全段、26.5放50%横线；用P50定义反推亲和。再把250放Hb竞争、50 g/L放发绀绝对量，避免三个数字互相替代。波尔/霍尔丹按输入→输出归类。",
        "KP07/08既有口诀；其余为对Current数字的分组，不新增医学结论。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp07",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp08",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp11",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp05",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r03-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r03",
        "logic_group_id": "respiratory-r03-lg03"
      },
      "cue": "持续气流受限的诊断边界与 GOLD 严重度数字最终需要精确恢复。",
      "members": [
        "respiratory-r03-kp09",
        "respiratory-r03-kp10",
        "respiratory-r03-kp11"
      ],
      "answer": "诊断与定级先分分母/前提：吸入支气管扩张剂后FEV1/FVC仍<70%，是本课程持续气流受限入口；需合看暴露、症状和其他病因，不是COPD独有。FEV1%pred用于GOLD肺功能严重度：1级≥80%；2级50%–79%；3级30%–49%；4级<30%。它不是一秒率，也不是症状/加重史的A/B/E治疗分组。\n把数字放回原LG的力学范围：小气道可先出现MEFV下降、闭合容积升高、动态顺应性下降；合并肺气肿的弹性破坏才可静态顺应性升高，不能记成所有COPD的必经先后。呼气受限且呼气时间不够、下一吸气尚未达静态平衡，才形成PEEPi；RV/FRC增大不能单独证明。\n肺功能条件：FEV1下降；FEV1/FVC下降；VA在通气失败时可下降；RV在滞气时常升、FRC在过充时常升，TLC在气肿等可升而非必然；课程RV/TLC>40%是肺气肿接口；DLCO在肺气肿/毛细床破坏时常下降，不能套所有气道为主COPD。\n血气：有效肺泡通气下降是CO₂潴留主轴；低VA/Q、高VA/Q和弥散面积丢失均可参与低氧。换气主导可PaO₂低、PaCO₂正常的Ⅰ型；通气不足主导可PaCO₂>50 mmHg并低氧，常慢性Ⅱ型。有血气以实际PaO₂/PaCO₂为准，不能凭病名覆盖。传统Ⅱ型判据完整背景为海平面、静息、室内空气PaO₂<60且PaCO₂>50；给氧纠正PaO₂不等于通气衰竭消失。",
      "required_visible_text": [
        "诊断与定级先分分母/前提：吸入支气管扩张剂后FEV1/FVC仍<70%，是本课程持续气流受限入口；需合看暴露、症状和其他病因，不是COPD独有。FEV1%pred用于GOLD肺功能严重度：1级≥80%；2级50%–79%；3级30%–49%；4级<30%。它不是一秒率，也不是症状/加重史的A/B/E治疗分组。\n把数字放回原LG的力学范围：小气道可先出现MEFV下降、闭合容积升高、动态顺应性下降；合并肺气肿的弹性破坏才可静态顺应性升高，不能记成所有COPD的必经先后。呼气受限且呼气时间不够、下一吸气尚未达静态平衡，才形成PEEPi；RV/FRC增大不能单独证明。\n肺功能条件：FEV1下降；FEV1/FVC下降；VA在通气失败时可下降；RV在滞气时常升、FRC在过充时常升，TLC在气肿等可升而非必然；课程RV/TLC>40%是肺气肿接口；DLCO在肺气肿/毛细床破坏时常下降，不能套所有气道为主COPD。\n血气：有效肺泡通气下降是CO₂潴留主轴；低VA/Q、高VA/Q和弥散面积丢失均可参与低氧。换气主导可PaO₂低、PaCO₂正常的Ⅰ型；通气不足主导可PaCO₂>50 mmHg并低氧，常慢性Ⅱ型。有血气以实际PaO₂/PaCO₂为准，不能凭病名覆盖。传统Ⅱ型判据完整背景为海平面、静息、室内空气PaO₂<60且PaCO₂>50；给氧纠正PaO₂不等于通气衰竭消失。",
        "原LG03完整PFT/气体失败条件，诊断阈值与严重度答案不丢原LG成员。",
        "原LG03成员KP09–11全部保留，定义/诊断限定另读KP06、KP13、KP14；GOLD与ABE区别另读KP16。",
        "固定70%属于当前课程/GOLD入口；一次舒张反应不能把COPD与哮喘绝对二分。",
        "不能把RV/FRC/TLC/DLCO简写成所有COPD无条件方向。",
        "低氧主因不由高CO₂机制一项覆盖；所有血气与呼衰阈值保留采样情境。",
        "先问“有没有持续限速”（支扩后比值70），再问“受限多重”（预计值80/50/30分界）；残气、弥散、血气分三条旁轴。用这一顺序复原数字，避免把ABE症状风险塞进肺功能分级。",
        "Current KP09–16同轴组织；无新卡片或新医学口诀。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp11",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp06",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp12",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp13",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp14",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r03-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r03",
        "logic_group_id": "respiratory-r03-lg05"
      },
      "cue": "长期家庭氧疗与 AECOPD 的关键阈值 / 用药边界最终需要精确恢复。",
      "members": [
        "respiratory-r03-kp16",
        "respiratory-r03-kp17",
        "respiratory-r03-kp18",
        "respiratory-r03-kp19",
        "respiratory-r03-kp20"
      ],
      "answer": "先分稳定慢性管理与急性加重，不能混用阈值或给药身份。\n稳定风险：课程去年中度加重≤1且未因加重住院为低风险；≥2次中度或因加重住院为E风险。mMRC 0仅剧烈活动气短、1快走/缓坡气短、2比同龄慢或自己节奏也要停、3约100m/几分钟需停、4不能离家或穿脱衣气短；0–1症状少、2–4症状多。课程A低风险少症、B低风险多症、E高风险；Current另标GOLD2026将一次中度加重作为升级治疗评估阈值，旧组不叫最新版。\n稳定用药：A一种支扩；B LABA＋LAMA；E LABA＋LAMA或符合条件三联加ICS。SABA沙丁胺醇/特布他林；SAMA异丙托溴铵；LABA沙美特罗/福莫特罗；LAMA噻托溴铵。ICS代表布地奈德、氟替卡松、倍氯米松；加重住院史、每年≥2次中度、血嗜酸≥300个/μL、伴哮喘共同评获益。300不是独立充分指征，区分初始/随访升级、当前支扩下持续加重及肺炎等风险。茶碱为课程列举，不等于常用吸入支扩的默认地位。\nLTOT：生存获益主要面向稳定慢性重度静息低氧。Current ATS条件示例PaO₂≤55 mmHg或SpO₂≤88%；或PaO₂56–59/SpO₂89%并水肿、红细胞增多或肺型P等；至少15h/d并复评。课程长期目标PaO₂≥60、SaO₂≥90%；鼻导1–2 L/min，“约30%”只是随设备/呼吸模式/分钟通气变化的粗估。\n氧致高碳酸不只因低氧驱动被解除：还要看V/Q恶化、霍尔丹效应及部分通气下降。高碳酸风险AECOPD常按SpO₂88–92%滴定，复查血气、评通气支持；不能延误严重低氧纠正，也不能把此目标套所有Ⅱ型或CO中毒。LTOT目标与急性滴定情境分开，吸氧不替代排CO₂。\nAECOPD：感染最常见触发，咳痰喘加重、黄脓痰/发热、气促/血气恶化。课程Ⅰ级无高碳酸呼衰且无意识变，Ⅱ级有呼衰而意识未变，Ⅲ级有呼衰并意识变/肺性脑病。感染按必要抗菌，痉挛吸入支扩，住院炎症加重用口服或静脉全身激素；稳定期条件性ICS不能混为同一给药身份。低氧滴定；适合且无禁忌的急性高碳酸呼衰评NIV。不能保护气道、持续循环不稳、呼吸停止或NIV失败需升级有创；Ⅲ级要求立即评通气/保护气道，不是所有意识变化自动插管，不为试NIV延误。\n酸碱/药物安全：呼酸先改善通气/病因；课程pH<7.2只是补碱接口，要看新增CO₂能否排出、混合代酸和循环不稳。通气失败/意识差不可自行加镇静抑呼吸药；课程吗啡禁用不能扩大到所有呼吸病、所有目的和专业监护下永久绝对禁忌。",
      "required_visible_text": [
        "先分稳定慢性管理与急性加重，不能混用阈值或给药身份。\n稳定风险：课程去年中度加重≤1且未因加重住院为低风险；≥2次中度或因加重住院为E风险。mMRC 0仅剧烈活动气短、1快走/缓坡气短、2比同龄慢或自己节奏也要停、3约100m/几分钟需停、4不能离家或穿脱衣气短；0–1症状少、2–4症状多。课程A低风险少症、B低风险多症、E高风险；Current另标GOLD2026将一次中度加重作为升级治疗评估阈值，旧组不叫最新版。\n稳定用药：A一种支扩；B LABA＋LAMA；E LABA＋LAMA或符合条件三联加ICS。SABA沙丁胺醇/特布他林；SAMA异丙托溴铵；LABA沙美特罗/福莫特罗；LAMA噻托溴铵。ICS代表布地奈德、氟替卡松、倍氯米松；加重住院史、每年≥2次中度、血嗜酸≥300个/μL、伴哮喘共同评获益。300不是独立充分指征，区分初始/随访升级、当前支扩下持续加重及肺炎等风险。茶碱为课程列举，不等于常用吸入支扩的默认地位。\nLTOT：生存获益主要面向稳定慢性重度静息低氧。Current ATS条件示例PaO₂≤55 mmHg或SpO₂≤88%；或PaO₂56–59/SpO₂89%并水肿、红细胞增多或肺型P等；至少15h/d并复评。课程长期目标PaO₂≥60、SaO₂≥90%；鼻导1–2 L/min，“约30%”只是随设备/呼吸模式/分钟通气变化的粗估。\n氧致高碳酸不只因低氧驱动被解除：还要看V/Q恶化、霍尔丹效应及部分通气下降。高碳酸风险AECOPD常按SpO₂88–92%滴定，复查血气、评通气支持；不能延误严重低氧纠正，也不能把此目标套所有Ⅱ型或CO中毒。LTOT目标与急性滴定情境分开，吸氧不替代排CO₂。\nAECOPD：感染最常见触发，咳痰喘加重、黄脓痰/发热、气促/血气恶化。课程Ⅰ级无高碳酸呼衰且无意识变，Ⅱ级有呼衰而意识未变，Ⅲ级有呼衰并意识变/肺性脑病。感染按必要抗菌，痉挛吸入支扩，住院炎症加重用口服或静脉全身激素；稳定期条件性ICS不能混为同一给药身份。低氧滴定；适合且无禁忌的急性高碳酸呼衰评NIV。不能保护气道、持续循环不稳、呼吸停止或NIV失败需升级有创；Ⅲ级要求立即评通气/保护气道，不是所有意识变化自动插管，不为试NIV延误。\n酸碱/药物安全：呼酸先改善通气/病因；课程pH<7.2只是补碱接口，要看新增CO₂能否排出、混合代酸和循环不稳。通气失败/意识差不可自行加镇静抑呼吸药；课程吗啡禁用不能扩大到所有呼吸病、所有目的和专业监护下永久绝对禁忌。",
        "原LG05的LTOT/AECOPD关键阈值与用药边界；全成员/版本差异保留，不声称完整现代处方。",
        "原LG05全成员KP16–20保留，不能只留下LTOT数字或改锚KP18。",
        "课程ABE与GOLD2026并列，不以本提案更新指南；稳定/急性氧疗、ICS/全身激素明确分开。",
        "LTOT适应证是Current给出的条件示例；红细胞增多未提供Hct数值，不补造。",
        "Current未给完整抗菌药名/剂量/疗程、NIV数值准入细则；本cue恢复已存在关键阈值与用药边界，这些未提供的MI-D细则保持Source/HOLD。",
        "把记忆分“稳—氧—急—安全”：稳定先ABE和ICS获益；氧疗先问长期适应证还是急性滴定；急发用意识与气道保护升级；pH只放在通气优先条件后。mMRC沿活动能力从剧烈→快走→同龄→百米→穿衣递减。",
        "Current KP16–20及R2 KP15既有顺序/情境组织，没有新剂量或处方。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp17",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp18",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp19",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r03",
          "kp_id": "respiratory-r03-kp20",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r02",
          "kp_id": "respiratory-r02-kp15",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r05-lg01-precision",
      "anchor": {
        "block_id": "respiratory-r05",
        "logic_group_id": "respiratory-r05-lg01"
      },
      "cue": "CAP / HAP 时间边界与 CURB-65 五项阈值最终需要精确恢复。",
      "members": [
        "respiratory-r05-kp01",
        "respiratory-r05-kp02",
        "respiratory-r05-kp03",
        "respiratory-r05-kp04"
      ],
      "answer": "CAP：医院外发生；或院外感染有明确潜伏期的病原体，入院后仍在潜伏期内发病。不能用‘已经住院’一项直接排除CAP。HAP：入院时不存在、也不处于潜伏期，加上入院≥48小时后医院内新发生。\nCURB-65五项：C意识障碍；U血尿素>7 mmol/L；R呼吸频率≥30次/分；B收缩压<90或舒张压≤60 mmHg，任一满足即可；65年龄≥65岁。它是严重度入口，不是病原诊断。\n血尿素7 mmol/L不能直接当作BUN的mg/dL数值。血压条件是‘或’，不能改为两者同时满足。肺炎并休克时循环复苏/补液与尽快抗感染并行；不等待补液结束才给药，取材不应造成明显延误。",
      "required_visible_text": [
        "CAP：医院外发生；或院外感染有明确潜伏期的病原体，入院后仍在潜伏期内发病。不能用‘已经住院’一项直接排除CAP。HAP：入院时不存在、也不处于潜伏期，加上入院≥48小时后医院内新发生。\nCURB-65五项：C意识障碍；U血尿素>7 mmol/L；R呼吸频率≥30次/分；B收缩压<90或舒张压≤60 mmHg，任一满足即可；65年龄≥65岁。它是严重度入口，不是病原诊断。\n血尿素7 mmol/L不能直接当作BUN的mg/dL数值。血压条件是‘或’，不能改为两者同时满足。肺炎并休克时循环复苏/补液与尽快抗感染并行；不等待补液结束才给药，取材不应造成明显延误。",
        "Cue仍属于lg01（空间、环境、证据、严重度），不缩成KP02或KP04单卡。完整药原清单与样本阈值仍在本LG Current Core；本cue精确答案限定原cue时间/严重度意图。",
        "定义只用于Current的CAP/HAP获得环境；潜伏期与入院时间必须合看。",
        "不额外引入Current未给出的CURB评分分层或住院切点。",
        "严重度不替代空间、影像与合格病原证据，原LG01四成员全部保留。",
        "先问‘何处获得、入院时是否已经存在/潜伏’，再逐字恢复C-U-R-B-65。把尿素的单位与血压的‘或’单独核对；已有CURB缩写是检索支架，不新增医学口诀。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp01",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp02",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp03",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp04",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r05-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r05",
        "logic_group_id": "respiratory-r05-lg03"
      },
      "cue": "高频病原—治疗药物的精确配对按当前 Study 口径最终需要稳定。",
      "members": [
        "respiratory-r05-kp09",
        "respiratory-r05-kp10",
        "respiratory-r05-kp11",
        "respiratory-r05-kp12",
        "respiratory-r05-kp13",
        "respiratory-r05-kp14"
      ],
      "answer": "肺炎链球菌：课程首选青霉素，实际结合药敏、感染部位和当地耐药；耐药时课程选项为喹诺酮、头孢噻肟、头孢曲松。合并休克时复苏和抗感染并行；抗菌约3天仍不退热或降后复升，既要查脓胸/心包炎/关节炎等肺外感染，也要复核病原、耐药、给药和其他并发症。\n金葡菌：非MRSA课程选苯唑西林、氯唑西林或头孢呋辛；MRSA选万古霉素、替考拉宁、利奈唑胺或头孢洛林。不得把前一组作为MRSA覆盖。\n克雷伯：课程β-内酰胺类；重症按课程可联合喹诺酮或氨基糖苷（阿米卡星、妥布霉素）。须看药敏和耐药机制，不能把所有β-内酰胺视作等效。\n支原体：课程因大环内酯耐药列左氧氟沙星、莫西沙星为首选，四环素类也可用，β-内酰胺无效。该成人/课程选项不能外推全部年龄和地区；课程妊娠、哺乳、<18岁不用喹诺酮。儿童通常仍从大环内酯起步，无改善或耐药再按年龄与风险选择替代；需合看当地耐药和疗效。\n军团菌：课程六组选项是大环内酯、喹诺酮、多西环素、替加环素、复方磺胺甲噁唑、利福平。保留为课程代表选项，不把六种任意等效互换；军团菌虽为非典型病原，但可为纤维素性化脓性实质炎，不以‘间质病原’代称。\n病毒性：先对症支持。课程列奥司他韦、利巴韦林、阿昔洛韦等，须按具体病毒与适应证选：奥司他韦用于流感，阿昔洛韦用于相应疱疹病毒，利巴韦林不能补造Current未给出的低频病毒精确配对。流感肺炎不因重症就常规用激素；另有哮喘急发、肾上腺功能不足、难治休克等适应证另论。不用抗生素预防继发细菌感染，确有细菌感染再用敏感药。",
      "required_visible_text": [
        "肺炎链球菌：课程首选青霉素，实际结合药敏、感染部位和当地耐药；耐药时课程选项为喹诺酮、头孢噻肟、头孢曲松。合并休克时复苏和抗感染并行；抗菌约3天仍不退热或降后复升，既要查脓胸/心包炎/关节炎等肺外感染，也要复核病原、耐药、给药和其他并发症。\n金葡菌：非MRSA课程选苯唑西林、氯唑西林或头孢呋辛；MRSA选万古霉素、替考拉宁、利奈唑胺或头孢洛林。不得把前一组作为MRSA覆盖。\n克雷伯：课程β-内酰胺类；重症按课程可联合喹诺酮或氨基糖苷（阿米卡星、妥布霉素）。须看药敏和耐药机制，不能把所有β-内酰胺视作等效。\n支原体：课程因大环内酯耐药列左氧氟沙星、莫西沙星为首选，四环素类也可用，β-内酰胺无效。该成人/课程选项不能外推全部年龄和地区；课程妊娠、哺乳、<18岁不用喹诺酮。儿童通常仍从大环内酯起步，无改善或耐药再按年龄与风险选择替代；需合看当地耐药和疗效。\n军团菌：课程六组选项是大环内酯、喹诺酮、多西环素、替加环素、复方磺胺甲噁唑、利福平。保留为课程代表选项，不把六种任意等效互换；军团菌虽为非典型病原，但可为纤维素性化脓性实质炎，不以‘间质病原’代称。\n病毒性：先对症支持。课程列奥司他韦、利巴韦林、阿昔洛韦等，须按具体病毒与适应证选：奥司他韦用于流感，阿昔洛韦用于相应疱疹病毒，利巴韦林不能补造Current未给出的低频病毒精确配对。流感肺炎不因重症就常规用激素；另有哮喘急发、肾上腺功能不足、难治休克等适应证另论。不用抗生素预防继发细菌感染，确有细菌感染再用敏感药。",
        "保持LG03六个病原成员、单一cue身份；不拆六张新卡。",
        "这是Current Study配对恢复，不是新的统一经验处方、剂量或疗程。",
        "药敏、耐药身份、年龄、妊娠/哺乳和具体病毒条件属于完整答案，不能藏到链接里。",
        "利巴韦林具体低频病毒配对不在Current，本次不补；原cue要求的Current药名及其范围均已保留。",
        "低频病毒—利巴韦林精确配对是单独MI-D Source边界，不在此推断。",
        "按六个原有病原模型逐行恢复‘课程代表药→改变选择的条件’：链球菌看药敏；金葡先分MSSA/MRSA；克雷伯看耐药机制；支原体看年龄/妊娠；军团菌保留六组；病毒先问具体病毒。分组帮助恢复，不新增第二份医学药谱。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp11",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp12",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp13",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp14",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r05",
          "kp_id": "respiratory-r05-kp04",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r06-lg02-precision",
      "anchor": {
        "block_id": "respiratory-r06",
        "logic_group_id": "respiratory-r06-lg02"
      },
      "cue": "大咯血数值边界与止血药禁忌最终需要精确恢复。",
      "members": [
        "respiratory-r06-kp07",
        "respiratory-r06-kp08",
        "respiratory-r06-kp09",
        "respiratory-r06-kp10"
      ],
      "answer": "课程中等量咯血两药：垂体后叶素以大剂量VP/ADH收缩血管；酚妥拉明以α受体阻断、扩血管降低肺血管压力。\n垂体后叶素四项禁忌：高血压、冠心病、肾衰、妊娠。酚妥拉明可用于课程所述伴高血压或肺心病者，不能把它和垂体后叶素的血管方向混为一谈。\n课程大量咯血：>500 mL/日，或>100 mL/次。这个数值不是生命危险或救治启动的必要条件；少于此量也会因血块阻塞气道窒息。外见咯血量减少不代表严重度下降。\n先保护气道、稳定循环，药物止血不能延误气道及介入评估。持续显著咯血常优先考虑支气管动脉栓塞；局限病变同样可栓塞。课程‘弥漫→栓塞、局限→手术’仅是简化分支，手术须结合可切除性、肺储备、病因和其他止血措施成败，不能仅凭局限决定。\n正在咯血或不能有效保护气道时，应重新评估清除方式，不能强行套普通体位引流。完整急救体位、气道和介入操作细则不在本Block新增。",
      "required_visible_text": [
        "课程中等量咯血两药：垂体后叶素以大剂量VP/ADH收缩血管；酚妥拉明以α受体阻断、扩血管降低肺血管压力。\n垂体后叶素四项禁忌：高血压、冠心病、肾衰、妊娠。酚妥拉明可用于课程所述伴高血压或肺心病者，不能把它和垂体后叶素的血管方向混为一谈。\n课程大量咯血：>500 mL/日，或>100 mL/次。这个数值不是生命危险或救治启动的必要条件；少于此量也会因血块阻塞气道窒息。外见咯血量减少不代表严重度下降。\n先保护气道、稳定循环，药物止血不能延误气道及介入评估。持续显著咯血常优先考虑支气管动脉栓塞；局限病变同样可栓塞。课程‘弥漫→栓塞、局限→手术’仅是简化分支，手术须结合可切除性、肺储备、病因和其他止血措施成败，不能仅凭局限决定。\n正在咯血或不能有效保护气道时，应重新评估清除方式，不能强行套普通体位引流。完整急救体位、气道和介入操作细则不在本Block新增。",
        "单一lg02 cue保持范围；抗假单胞菌完整名单另有Current KP09，未以此cue名义扩成新药谱卡。",
        "严格保留>而非≥；日总量与单次数值为‘或’。",
        "Current只给中等量用药身份，没有中等量数值区间，不能自行补出。",
        "LG02包含清痰、感染和鉴别，依赖全部原成员，不改锚点。",
        "先气道，后量级：数值只分课程量级，堵塞决定紧迫性。再按‘收缩药→四禁忌；扩血管药→课程适用场景’对比。展开答案始终同时显示救治与程序边界。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp07",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp08",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp05",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r06-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r06",
        "logic_group_id": "respiratory-r06-lg03"
      },
      "cue": "误吸体位对应肺段与关键抗感染配对最终需要精确恢复。",
      "members": [
        "respiratory-r06-kp11",
        "respiratory-r06-kp12",
        "respiratory-r06-kp13",
        "respiratory-r06-kp14",
        "respiratory-r06-kp15"
      ],
      "answer": "三入口：吸入性最常见，厌氧菌为主，右肺多、通常单发；血源性常金葡菌、双肺外周多发；继发性依既有病灶/阻塞或邻近感染而变。右主支气管粗、短、陡解释误吸侧别，具体肺段还取决于误吸当时体位。\n仰卧：上叶后段或下叶背段。坐位：下叶后基底段。右侧卧：右上叶前段或后段。这是Current三个体位的精确肺段，不补造其他体位规则。\n吸入性抗感染课程配对：多数厌氧菌列青霉素；脆弱拟杆菌列甲硝唑+林可霉素类。必须同时保留校准：青霉素耐药可导致厌氧感染治疗失败，氨苄西林/舒巴坦等含β-内酰胺酶抑制剂方案有研究支持；脆弱拟杆菌不是一律固定双药，选择须结合感染来源、混合菌及药敏。历史研究不升级为2026统一首选。\n课程常见疗程6–8周；临床停药综合临床、炎症与影像反应，不能只看退热、痰臭消失或到某周数。课程影像终点：空洞周围炎症吸收→空洞缩小、消失→仅余少量纤维条索。\n血源性从皮肤外伤/疖/痈、骨髓炎、右心感染性心内膜炎等追源，血培养取证。课程苯唑西林或头孢呋辛须在相应MSSA条件内，不能覆盖MRSA；菌血症须复查血培养，查心内膜炎及远处灶，控制原发源。MRSA需专门方案，药物/疗程结合菌血症、心内膜炎与肺部感染，不套普通肺炎短疗程。\n继发性需查金葡、克雷伯、铜绿等坏死性肺炎，支扩/肺癌/结核继发感染，小儿异物，或阿米巴肝脓肿邻近累及右下肺。控制病原还要解除持续阻塞和引流障碍，不能只反复加抗菌药。",
      "required_visible_text": [
        "三入口：吸入性最常见，厌氧菌为主，右肺多、通常单发；血源性常金葡菌、双肺外周多发；继发性依既有病灶/阻塞或邻近感染而变。右主支气管粗、短、陡解释误吸侧别，具体肺段还取决于误吸当时体位。\n仰卧：上叶后段或下叶背段。坐位：下叶后基底段。右侧卧：右上叶前段或后段。这是Current三个体位的精确肺段，不补造其他体位规则。\n吸入性抗感染课程配对：多数厌氧菌列青霉素；脆弱拟杆菌列甲硝唑+林可霉素类。必须同时保留校准：青霉素耐药可导致厌氧感染治疗失败，氨苄西林/舒巴坦等含β-内酰胺酶抑制剂方案有研究支持；脆弱拟杆菌不是一律固定双药，选择须结合感染来源、混合菌及药敏。历史研究不升级为2026统一首选。\n课程常见疗程6–8周；临床停药综合临床、炎症与影像反应，不能只看退热、痰臭消失或到某周数。课程影像终点：空洞周围炎症吸收→空洞缩小、消失→仅余少量纤维条索。\n血源性从皮肤外伤/疖/痈、骨髓炎、右心感染性心内膜炎等追源，血培养取证。课程苯唑西林或头孢呋辛须在相应MSSA条件内，不能覆盖MRSA；菌血症须复查血培养，查心内膜炎及远处灶，控制原发源。MRSA需专门方案，药物/疗程结合菌血症、心内膜炎与肺部感染，不套普通肺炎短疗程。\n继发性需查金葡、克雷伯、铜绿等坏死性肺炎，支扩/肺癌/结核继发感染，小儿异物，或阿米巴肝脓肿邻近累及右下肺。控制病原还要解除持续阻塞和引流障碍，不能只反复加抗菌药。",
        "原LG身份、五个成员与单一cue不变。",
        "保留完整lg03 KP11–15，而非把体位记忆缩到KP12。",
        "不新增抗菌剂量、程序操作或临床统一首选。",
        "脓腔需要抗感染与引流/控源共同处理；早期无洞不排除肺脓肿。",
        "先分入口再配空间：气道误吸→体位/重力；血道菌栓→双肺外周；局部持续源→解除阻塞。体位分三格恢复，药物每格紧跟耐药/混合感染与终点条件。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp11",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp12",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp13",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp14",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r06",
          "kp_id": "respiratory-r06-kp15",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r08-lg03-precision",
      "anchor": {
        "block_id": "respiratory-r08",
        "logic_group_id": "respiratory-r08-lg03"
      },
      "cue": "结节病分期的精确影像组合最终需要精确恢复。",
      "members": [
        "respiratory-r08-kp07",
        "respiratory-r08-kp08",
        "respiratory-r08-kp09"
      ],
      "answer": "结节病课程影像I期：双肺门淋巴结肿大。II期：双肺门淋巴结肿大+肺部浸润影。III期：仅肺部浸润影。IV期：蜂窝肺、肺纤维化、肺气肿。\n分期描述影像分布/形态。III期肺门结消失不能直接判病情好转。多数患者无需治疗；症状严重者课程糖皮质激素，疗程6–24个月，不能把所有结节病都判为至少治6个月。\n完整识别背景：双肺门结伴皮肤眼部表现，BALF CD4↑、沿支气管血管束结节、活检非干酪性肉芽肿；支气管镜铺路石是黏膜载体，不是肺泡蛋白沉着的CT铺路石。与TB相比，非干酪/典型双侧肺门/PPD多阴对干酪/典型多单侧/PPD多阳，仍须结合影像组织与感染证据；免疫弱的TB也可PPD阴。",
      "required_visible_text": [
        "结节病课程影像I期：双肺门淋巴结肿大。II期：双肺门淋巴结肿大+肺部浸润影。III期：仅肺部浸润影。IV期：蜂窝肺、肺纤维化、肺气肿。\n分期描述影像分布/形态。III期肺门结消失不能直接判病情好转。多数患者无需治疗；症状严重者课程糖皮质激素，疗程6–24个月，不能把所有结节病都判为至少治6个月。\n完整识别背景：双肺门结伴皮肤眼部表现，BALF CD4↑、沿支气管血管束结节、活检非干酪性肉芽肿；支气管镜铺路石是黏膜载体，不是肺泡蛋白沉着的CT铺路石。与TB相比，非干酪/典型双侧肺门/PPD多阴对干酪/典型多单侧/PPD多阳，仍须结合影像组织与感染证据；免疫弱的TB也可PPD阴。",
        "保持a2-r08-lg03-precision及LG原范围。",
        "完整原LG03三成员作为证据/鉴别/分期共同范围；只把分期cue移到KP08将丢掉原范围，禁止。",
        "不增加Current未列的0期。",
        "PPD只是比较线索，阴阳不能独立确诊或排除；药敏TB6个月与结节病疗程不互相套用。",
        "按‘肺门结/肺内浸润/纤维化’三轴恢复：I结、II结加肺、III仅肺、IV纤维化形态。用影像定位作支架；III期肺门结消失不等于好转。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r08",
          "kp_id": "respiratory-r08-kp07",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r08",
          "kp_id": "respiratory-r08-kp08",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r08",
          "kp_id": "respiratory-r08-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r07",
          "kp_id": "respiratory-r07-kp18",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block7_肺结核_肉芽肿空洞播散与化疗_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r08",
          "kp_id": "respiratory-r08-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r09-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r09",
        "logic_group_id": "respiratory-r09-lg05"
      },
      "cue": "PE 危险分层、溶栓时间窗与抗凝疗程边界最终需要精确恢复。",
      "members": [
        "respiratory-r09-kp20",
        "respiratory-r09-kp21",
        "respiratory-r09-kp22"
      ],
      "answer": "先按血流动力学分层，再把抗凝与再灌注分工。\n低危：无右心功能不全、血压正常，直接抗凝，不溶栓。\n中危：结合右室、肌钙蛋白及临床风险，但无持续低压；抗凝＋监测，不常规全身溶栓，恶化评估救援再灌注。\n高危：心搏骤停；或阻塞性休克（低压／需升压支持并有低灌注）；或收缩压<90 mmHg／下降≥40 mmHg持续>15分钟，且排除新发心律失常、低容量、脓毒症等。紧急评估再灌注并安排抗凝，全身溶栓、导管或外科按风险和可用性选择，不能为等检查或完成抗凝延误。\n溶栓课程药：rt-PA、尿激酶、链激酶；时间窗≤14天，最严重并发症颅内出血。窗内不等于有适应证；活动性出血等禁忌仍评估。濒死个体化权衡不等于“绝对禁忌也一律溶”；禁忌或失败可导管／外科，不能称唯一方法。保留课程低／中／高框架，与AHA/ACC 2026 A–E版本分开。\n抗凝是无禁忌时基础：普通肝素、低分子肝素、磺达肝癸钠、华法林、直接口服抗凝药。免疫性HIT疑似／确诊须停肝素选非肝素药；磺达可用于合适稳定患者，须看肾功能和出血。急性HIT血小板恢复前不得直接启动华法林。非HIT常规华法林过渡须重叠至少5天且INR达治疗要求，不能第五天自动停肝素。\n疗程三层：短暂／可逆因素初发≥3个月；复发、APS、遗传性易栓、持续因素或来源不明初发延长；活动性肿瘤／持续风险常需长期，定期复评活动度、出血和获益，任何肿瘤史不等于终身。\n作用分工：抗凝阻新纤维蛋白网／血栓扩大；抗血小板不是PTE主轴；溶栓溶已成纤维蛋白血栓。\n原LG完整比较范围保留：慢性肺病多年、右室先肥厚后扩张、右衰可双腿对称水肿、COPD可高CO₂，控制感染／改善呼吸优先；急PTE多突发、DVT常不对称、右室急扩、常低PaO₂／低PaCO₂但非必需，无禁忌抗凝，高危评再灌注。两者可共存，任何单征不定病。",
      "required_visible_text": [
        "先按血流动力学分层，再把抗凝与再灌注分工。\n低危：无右心功能不全、血压正常，直接抗凝，不溶栓。\n中危：结合右室、肌钙蛋白及临床风险，但无持续低压；抗凝＋监测，不常规全身溶栓，恶化评估救援再灌注。\n高危：心搏骤停；或阻塞性休克（低压／需升压支持并有低灌注）；或收缩压<90 mmHg／下降≥40 mmHg持续>15分钟，且排除新发心律失常、低容量、脓毒症等。紧急评估再灌注并安排抗凝，全身溶栓、导管或外科按风险和可用性选择，不能为等检查或完成抗凝延误。\n溶栓课程药：rt-PA、尿激酶、链激酶；时间窗≤14天，最严重并发症颅内出血。窗内不等于有适应证；活动性出血等禁忌仍评估。濒死个体化权衡不等于“绝对禁忌也一律溶”；禁忌或失败可导管／外科，不能称唯一方法。保留课程低／中／高框架，与AHA/ACC 2026 A–E版本分开。\n抗凝是无禁忌时基础：普通肝素、低分子肝素、磺达肝癸钠、华法林、直接口服抗凝药。免疫性HIT疑似／确诊须停肝素选非肝素药；磺达可用于合适稳定患者，须看肾功能和出血。急性HIT血小板恢复前不得直接启动华法林。非HIT常规华法林过渡须重叠至少5天且INR达治疗要求，不能第五天自动停肝素。\n疗程三层：短暂／可逆因素初发≥3个月；复发、APS、遗传性易栓、持续因素或来源不明初发延长；活动性肿瘤／持续风险常需长期，定期复评活动度、出血和获益，任何肿瘤史不等于终身。\n作用分工：抗凝阻新纤维蛋白网／血栓扩大；抗血小板不是PTE主轴；溶栓溶已成纤维蛋白血栓。\n原LG完整比较范围保留：慢性肺病多年、右室先肥厚后扩张、右衰可双腿对称水肿、COPD可高CO₂，控制感染／改善呼吸优先；急PTE多突发、DVT常不对称、右室急扩、常低PaO₂／低PaCO₂但非必需，无禁忌抗凝，高危评再灌注。两者可共存，任何单征不定病。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "三层风险配三层动作；抗凝疗程另用“短暂≥3月／持续延长／活动肿瘤复评长期”。时间、右室、腿征、血气、治疗同轴比较慢／急。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r09",
          "kp_id": "respiratory-r09-kp20",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r09",
          "kp_id": "respiratory-r09-kp21",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r09",
          "kp_id": "respiratory-r09-kp22",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r09",
          "kp_id": "respiratory-r09-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r10-kp02-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp02"
      },
      "cue": "进行性血胸的持续引流阈值与判定数字最终需要精确恢复。",
      "members": [
        "respiratory-r10-kp02"
      ],
      "answer": "进行性血胸依四组持续出血证据共同判断：\n1. 胸腔闭式引流量每小时>200 mL，持续3小时。\n2. 脉搏持续加快、血压降低，或补充血容量后仍不稳定。\n3. Hb、RBC、Hct进行性下降。\n4. 引流血Hb／RBC与周围血相近，且迅速凝固。\n处理：开胸探查；胸腔处理与循环容量丢失同时关注。一次抽到血不等于进行性出血。血性胸水仅为胸水带血，血胸为全血入胸膜腔；不能以这两个身份互换阈值。",
      "required_visible_text": [
        "进行性血胸依四组持续出血证据共同判断：\n1. 胸腔闭式引流量每小时>200 mL，持续3小时。\n2. 脉搏持续加快、血压降低，或补充血容量后仍不稳定。\n3. Hb、RBC、Hct进行性下降。\n4. 引流血Hb／RBC与周围血相近，且迅速凝固。\n处理：开胸探查；胸腔处理与循环容量丢失同时关注。一次抽到血不等于进行性出血。血性胸水仅为胸水带血，血胸为全血入胸膜腔；不能以这两个身份互换阈值。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "按“流量持续／循环不稳／血象下降／引流血近外周且凝”四证据回忆；数字只绑定第一证据。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp02",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp01",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp23",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r10-kp04-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp04"
      },
      "cue": "胸水化验比值、梯度与 Light 判定边界最终需要精确恢复。",
      "members": [
        "respiratory-r10-kp04"
      ],
      "answer": "先理解机制：局部炎症／通透性增加多为渗出，系统静水压／胶渗压失衡多为漏出；药物／超敏胸膜炎归渗出（R10-SC01）。\nLight三条任一满足即渗出：胸水／血清蛋白>0.5；胸水／血清LDH>0.6；胸水LDH>血清LDH正常上限的2/3。三条均不满足才支持漏出。一个比值阴性不够。\n完整定量对照（典型方向，不要求每项同时符合）：\n- 比重：渗出>1.018；漏出<1.018。\n- 外观／凝固：渗出混浊、可凝；漏出清亮、不凝。\n- 蛋白：渗出>30 g/L、Rivalta＋；漏出<30 g/L、Rivalta−。\n- 葡萄糖：部分感染、恶性或类风湿胸水可降低，并非所有渗出均<3.3 mmol/L；漏出常与血糖相近。\n- 细胞：渗出>500×10⁶/L；漏出多<100×10⁶/L。\n- 蛋白比：>0.5为Light一条；不超过0.5且其余Light亦阴性才按漏出判断。\n- LDH比：>0.6为Light一条；不超过0.6且其余Light亦阴性才按漏出判断。\n- 血清−胸水白蛋白梯度：课程渗出<12 g/L、漏出≥12 g/L；是辅助指标，不是Light必备条件。\n- 肿瘤细胞／细菌：渗出可有，漏出无（课程典型表）。\n利尿后心衰胸水可能假性渗出，结合病因和白蛋白梯度；外观、比重、Rivalta、细胞和葡萄糖均不能替代Light。原Extension表的“所有渗出低糖”和单一比值即漏出不得进入答案。",
      "required_visible_text": [
        "先理解机制：局部炎症／通透性增加多为渗出，系统静水压／胶渗压失衡多为漏出；药物／超敏胸膜炎归渗出（R10-SC01）。\nLight三条任一满足即渗出：胸水／血清蛋白>0.5；胸水／血清LDH>0.6；胸水LDH>血清LDH正常上限的2/3。三条均不满足才支持漏出。一个比值阴性不够。\n完整定量对照（典型方向，不要求每项同时符合）：\n- 比重：渗出>1.018；漏出<1.018。\n- 外观／凝固：渗出混浊、可凝；漏出清亮、不凝。\n- 蛋白：渗出>30 g/L、Rivalta＋；漏出<30 g/L、Rivalta−。\n- 葡萄糖：部分感染、恶性或类风湿胸水可降低，并非所有渗出均<3.3 mmol/L；漏出常与血糖相近。\n- 细胞：渗出>500×10⁶/L；漏出多<100×10⁶/L。\n- 蛋白比：>0.5为Light一条；不超过0.5且其余Light亦阴性才按漏出判断。\n- LDH比：>0.6为Light一条；不超过0.6且其余Light亦阴性才按漏出判断。\n- 血清−胸水白蛋白梯度：课程渗出<12 g/L、漏出≥12 g/L；是辅助指标，不是Light必备条件。\n- 肿瘤细胞／细菌：渗出可有，漏出无（课程典型表）。\n利尿后心衰胸水可能假性渗出，结合病因和白蛋白梯度；外观、比重、Rivalta、细胞和葡萄糖均不能替代Light。原Extension表的“所有渗出低糖”和单一比值即漏出不得进入答案。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "先“任一阳性／全阴才漏”，再将典型表按外观→蛋白／细胞→糖→比值／梯度分组；梯度带g/L。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp04",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp03",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r10-kp08-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp08"
      },
      "cue": "胸穿首次 / 后续容量、频率与相关边界最终需要精确恢复。",
      "members": [
        "respiratory-r10-kp08"
      ],
      "answer": "课程大量胸水抽液：每周2–3次，首次<800 mL，以后每次<1000 mL。目的为减轻肺受压／呼吸困难，同时避免胸膜腔压力及肺血流短时变化过大，不追求一次抽空。\n这些是讲义考试数值，不是所有病因固定每周抽液处方。Current另保留BTS 2023版本：缓慢引流，一般单次最多1.5 L；胸闷、胸痛、持续咳嗽或气促加重须提前停止。上限不是目标；需专业评估和超声定位。\n出现异常先停止、评估：抽快／多后剧咳、泡沫痰、湿啰音／低氧／新浸润提示复张后水肿；穿刺迷走反应则心率可慢、低压、苍白出汗／晕厥。不能把二者混为“抽够量后的正常反应”，不能默认利尿激素或普通迷走反应用肾上腺素。",
      "required_visible_text": [
        "课程大量胸水抽液：每周2–3次，首次<800 mL，以后每次<1000 mL。目的为减轻肺受压／呼吸困难，同时避免胸膜腔压力及肺血流短时变化过大，不追求一次抽空。\n这些是讲义考试数值，不是所有病因固定每周抽液处方。Current另保留BTS 2023版本：缓慢引流，一般单次最多1.5 L；胸闷、胸痛、持续咳嗽或气促加重须提前停止。上限不是目标；需专业评估和超声定位。\n出现异常先停止、评估：抽快／多后剧咳、泡沫痰、湿啰音／低氧／新浸润提示复张后水肿；穿刺迷走反应则心率可慢、低压、苍白出汗／晕厥。不能把二者混为“抽够量后的正常反应”，不能默认利尿激素或普通迷走反应用肾上腺素。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "课程“每周2–3／首800／后1000”与BTS“慢／一般≤1.5 L／症状先停”分开记，不拼成一个处方。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp08",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp10",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r10-kp16-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp16"
      },
      "cue": "闭合性气胸压缩比例与观察 / 抽气边界最终需要精确恢复。",
      "members": [
        "respiratory-r10-kp16"
      ],
      "answer": "闭合性又称单纯性气胸：破口已闭合；课程胸膜腔压低于大气压，纵隔可不移。课程肺压缩<20%观察，超过该范围采用穿刺抽气；Current没有把恰好20%的等号另外裁决，不能自行补成“≥20%必抽”。\n20%是课程简化分支。实际先看症状、低氧、循环稳定性、基础肺病及类型：现代原发自发性气胸可按症状观察，不仅凭大小；继发性、创伤性、正压通气患者不能套同一阈值。\n闭合只说明破口状态，不保证整个呼吸周期都低于大气压，也不排张力生理。若持续升压造成呼吸／循环障碍，需按张力性立即减压，不能等待大小达到阈值。",
      "required_visible_text": [
        "闭合性又称单纯性气胸：破口已闭合；课程胸膜腔压低于大气压，纵隔可不移。课程肺压缩<20%观察，超过该范围采用穿刺抽气；Current没有把恰好20%的等号另外裁决，不能自行补成“≥20%必抽”。\n20%是课程简化分支。实际先看症状、低氧、循环稳定性、基础肺病及类型：现代原发自发性气胸可按症状观察，不仅凭大小；继发性、创伤性、正压通气患者不能套同一阈值。\n闭合只说明破口状态，不保证整个呼吸周期都低于大气压，也不排张力生理。若持续升压造成呼吸／循环障碍，需按张力性立即减压，不能等待大小达到阈值。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "先“稳不稳／何种气胸”，后读课程大小分支；“破口闭”不等于“无张力”。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp18",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r10-kp19-precision",
      "anchor": {
        "block_id": "respiratory-r10",
        "kp_id": "respiratory-r10-kp19"
      },
      "cue": "胸管位置、插拔呼吸时相与拔管组合最终需要精确恢复。",
      "members": [
        "respiratory-r10-kp19"
      ],
      "answer": "课程传统位置：气胸锁骨中线第2肋间；胸水腋中线与腋后线之间第6–7肋间。不能替代术前影像和安全定位；液体须超声定位，正式置管常在安全三角选合适位置，不把应急针刺减压点当正式胸管点。\n呼吸配合：插管深呼气后屏气；课程拔管深吸气后屏气。现代操作按流程配合屏气／Valsalva并立即密闭创口，吸气末或呼气末不是唯一成败因素。\n拔管四组合：肺复张好且无气液排出→拔；肺不张且有排出→不拔；复张好、少量残留、管通畅→继续引流；复张好、少量残留、堵塞→课程列可拔，但实际先明确堵塞、漏气／积液和复张状态，堵塞绝不是自动拔管依据。\nCurrent列出的适应证完整保留六行：中／大量闭合性气胸；开放／张力性气胸；穿刺后肺未复张；机械通气相关气胸／血气胸；拔管后复发；开胸术后。Prompt“适应5”仍保持身份原文，不删第六行求齐数字。\n紧急边界：张力性先立即减压；开放封口后监测张力恶化；闭合性大小阈值服从症状、稳定性、基础病和类型。以上是课程提取及安全条件，不构成完整胸管操作教程。",
      "required_visible_text": [
        "课程传统位置：气胸锁骨中线第2肋间；胸水腋中线与腋后线之间第6–7肋间。不能替代术前影像和安全定位；液体须超声定位，正式置管常在安全三角选合适位置，不把应急针刺减压点当正式胸管点。\n呼吸配合：插管深呼气后屏气；课程拔管深吸气后屏气。现代操作按流程配合屏气／Valsalva并立即密闭创口，吸气末或呼气末不是唯一成败因素。\n拔管四组合：肺复张好且无气液排出→拔；肺不张且有排出→不拔；复张好、少量残留、管通畅→继续引流；复张好、少量残留、堵塞→课程列可拔，但实际先明确堵塞、漏气／积液和复张状态，堵塞绝不是自动拔管依据。\nCurrent列出的适应证完整保留六行：中／大量闭合性气胸；开放／张力性气胸；穿刺后肺未复张；机械通气相关气胸／血气胸；拔管后复发；开胸术后。Prompt“适应5”仍保持身份原文，不删第六行求齐数字。\n紧急边界：张力性先立即减压；开放封口后监测张力恶化；闭合性大小阈值服从症状、稳定性、基础病和类型。以上是课程提取及安全条件，不构成完整胸管操作教程。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "位置、呼吸时相、拔管三变量分开；拔管用“肺／残留排出／管通畅”三轴，不用堵塞单项。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp19",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp17",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r10",
          "kp_id": "respiratory-r10-kp18",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r11-kp21-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "kp_id": "respiratory-r11-kp21"
      },
      "cue": "T 分期的三个直径边界与等号归属最终需要精确恢复。",
      "members": [
        "respiratory-r11-kp21"
      ],
      "answer": "课程简化T大小：T1≤3 cm；T2>3且≤5 cm；T3>5且≤7 cm；T4>7 cm。故3 cm归T1、5 cm归T2、7 cm归T3，“等号归较小档”。\n肺癌T仍看大小与侵犯范围，这张表不是完整分期；消化管肿瘤常重浸润深度，不能跨器官机械套用。T4也不等于任何情形不可切，治疗还看具体侵犯结构、N／M及多学科评估。",
      "required_visible_text": [
        "课程简化T大小：T1≤3 cm；T2>3且≤5 cm；T3>5且≤7 cm；T4>7 cm。故3 cm归T1、5 cm归T2、7 cm归T3，“等号归较小档”。\n肺癌T仍看大小与侵犯范围，这张表不是完整分期；消化管肿瘤常重浸润深度，不能跨器官机械套用。T4也不等于任何情形不可切，治疗还看具体侵犯结构、N／M及多学科评估。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "记3／5／7三界及等号向较小档；大小档与侵犯／可切除判断分层。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp21",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp20",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r11-kp22-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "kp_id": "respiratory-r11-kp22"
      },
      "cue": "N / M 分层的空间边界与 M1 细分最终需要精确恢复。",
      "members": [
        "respiratory-r11-kp22"
      ],
      "answer": "N0无区域结转移；N1同侧支气管周围、肺门、肺内；N2同侧纵隔、隆突下；N3对侧肺门／纵隔，或前斜角肌及锁骨上结。\nM1三入口：对侧肺叶同一肺癌转移结节（须区别同步第二原发）；恶性胸／心包积液或胸膜／心包结节；远处器官灶。对侧肺同癌结节归M，对侧肺门／纵隔结归N3。\n胸水可反应性或回流受阻，不自动恶性；癌细胞阳性可确认，但一次细胞阴性不排恶性，胸膜结节组织证据和完整临床分期也重要，不能要求只有抽到癌细胞才可M1。\nM1a胸腔内播散／对侧肺结节／恶性胸心包受累；M1b胸腔外单发；M1c远处多发，Current Source补M1c1一个胸外器官内多发，M1c2多个胸外器官多发。第9版N2a单站、N2b多站，仅作版本辨认，与较早题粗类分开。\n分期与治疗不是单个字母自动等同；可切除性还看具体结构及完整N／M、耐受和多学科条件。",
      "required_visible_text": [
        "N0无区域结转移；N1同侧支气管周围、肺门、肺内；N2同侧纵隔、隆突下；N3对侧肺门／纵隔，或前斜角肌及锁骨上结。\nM1三入口：对侧肺叶同一肺癌转移结节（须区别同步第二原发）；恶性胸／心包积液或胸膜／心包结节；远处器官灶。对侧肺同癌结节归M，对侧肺门／纵隔结归N3。\n胸水可反应性或回流受阻，不自动恶性；癌细胞阳性可确认，但一次细胞阴性不排恶性，胸膜结节组织证据和完整临床分期也重要，不能要求只有抽到癌细胞才可M1。\nM1a胸腔内播散／对侧肺结节／恶性胸心包受累；M1b胸腔外单发；M1c远处多发，Current Source补M1c1一个胸外器官内多发，M1c2多个胸外器官多发。第9版N2a单站、N2b多站，仅作版本辨认，与较早题粗类分开。\n分期与治疗不是单个字母自动等同；可切除性还看具体结构及完整N／M、耐受和多学科条件。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "先分“肺实质结节／淋巴结”，再分侧别与区域；M细分按胸内／胸外单发／单器官多发／多器官多发。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp22",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp20",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r11-lg05-precision",
      "anchor": {
        "block_id": "respiratory-r11",
        "logic_group_id": "respiratory-r11-lg05"
      },
      "cue": "靶点—药物配对与 SCLC / NSCLC 治疗边界最终需要稳定精确。",
      "members": [
        "respiratory-r11-kp19",
        "respiratory-r11-kp20",
        "respiratory-r11-kp21",
        "respiratory-r11-kp22"
      ],
      "answer": "先组织与范围，再耐受／可切除性，最后靶点和方案；保留原LG全部KP19–22的范围。\n靶点—课程代表药四组：EGFR／HER1／ERBB1突变→厄洛替尼、吉非替尼；ALK或ROS1重排→克唑替尼；VEGF-A→贝伐珠单抗；PD-1→帕博利珠单抗（讲义“派姆单抗”）。PD-L1表达可作部分方案选择指标，但直接靶点是PD-1；检查点治疗不同于EGFR／ALK驱动靶向。课程药不代表所有分期现代一线，仍看突变亚型、分期及联合方案。\nSCLC早期广泛播散、放化疗敏感，课程首选依托泊苷＋铂类化疗；敏感不等于好预后，早播散与耐药仍在。临床须分局限／广泛及适用条件选放化疗、免疫等，少数很早且完成纵隔分期者可手术，非一律禁止。\nNSCLC I／II期可切且能耐受者手术是重要根治手段；不能手术仍有根治放疗等选择。课程T4／N3／M1快捷不可手术边界中，T4需看具体侵犯结构、N／M与多学科，不能一律不可切；晚期不只放化疗，还看分子／免疫指标。放疗可缩瘤、缓解气促疼痛，也可骨髓抑制使全血细胞减少。\n原范围内T：≤3 cm／>3–≤5／>5–≤7／>7分别T1／T2／T3／T4，等号归较小档，仍看侵犯。\n原范围内N：N0无区域结；N1同侧支气管周围／肺门／肺内；N2同侧纵隔／隆突下；N3对侧肺门／纵隔或前斜角／锁骨上。第9版N2a单站、N2b多站，版本分开。\n原范围内M：对侧肺同癌转移须别第二原发；恶性胸心包液／结节；远处灶。M1a胸内，M1b胸外单发，M1c多发含c1单胸外器官内多发、c2多胸外器官多发。对侧肺结节M1不同于对侧结N3，癌患者胸水不自动恶性，一次细胞阴性不排；不得以“只有抽到癌细胞”为M1必要条件。\n检查接口：影像回答分布与范围，分子检测回答靶点；不以PET浓聚代替组织确诊。完整现代处方、放疗剂量及手术术式仍在本Source之外。",
      "required_visible_text": [
        "先组织与范围，再耐受／可切除性，最后靶点和方案；保留原LG全部KP19–22的范围。\n靶点—课程代表药四组：EGFR／HER1／ERBB1突变→厄洛替尼、吉非替尼；ALK或ROS1重排→克唑替尼；VEGF-A→贝伐珠单抗；PD-1→帕博利珠单抗（讲义“派姆单抗”）。PD-L1表达可作部分方案选择指标，但直接靶点是PD-1；检查点治疗不同于EGFR／ALK驱动靶向。课程药不代表所有分期现代一线，仍看突变亚型、分期及联合方案。\nSCLC早期广泛播散、放化疗敏感，课程首选依托泊苷＋铂类化疗；敏感不等于好预后，早播散与耐药仍在。临床须分局限／广泛及适用条件选放化疗、免疫等，少数很早且完成纵隔分期者可手术，非一律禁止。\nNSCLC I／II期可切且能耐受者手术是重要根治手段；不能手术仍有根治放疗等选择。课程T4／N3／M1快捷不可手术边界中，T4需看具体侵犯结构、N／M与多学科，不能一律不可切；晚期不只放化疗，还看分子／免疫指标。放疗可缩瘤、缓解气促疼痛，也可骨髓抑制使全血细胞减少。\n原范围内T：≤3 cm／>3–≤5／>5–≤7／>7分别T1／T2／T3／T4，等号归较小档，仍看侵犯。\n原范围内N：N0无区域结；N1同侧支气管周围／肺门／肺内；N2同侧纵隔／隆突下；N3对侧肺门／纵隔或前斜角／锁骨上。第9版N2a单站、N2b多站，版本分开。\n原范围内M：对侧肺同癌转移须别第二原发；恶性胸心包液／结节；远处灶。M1a胸内，M1b胸外单发，M1c多发含c1单胸外器官内多发、c2多胸外器官多发。对侧肺结节M1不同于对侧结N3，癌患者胸水不自动恶性，一次细胞阴性不排；不得以“只有抽到癌细胞”为M1必要条件。\n检查接口：影像回答分布与范围，分子检测回答靶点；不以PET浓聚代替组织确诊。完整现代处方、放疗剂量及手术术式仍在本Source之外。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "“组织／TNM／能否耐受与可切／靶点”四步；药表按受体驱动—重排—血管生成—免疫检查点分组，PD-1和PD-L1分开。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp19",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp20",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp21",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp22",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp05",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r11",
          "kp_id": "respiratory-r11-kp18",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp08-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp08"
      },
      "cue": "P/F 定义与三档分度最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp08"
      ],
      "answer": "首选动脉血气。P/F=PaO₂（mmHg）÷FiO₂（小数），单位mmHg；例PaO₂80、FiO₂40%：80/0.40=200。\n课程必要氧合条件P/F≤300；轻200<P/F≤300，中100<P/F≤200，重≤100。200归中、100归重、300归轻。\n按Berlin版本使用须同时满足相应正压条件：PEEP≥5 cmH₂O，轻度可CPAP≥5；还须起病时间、双肺影像及水肿来源条件，不能仅凭P/F降低确诊，也不把该版本视作全部现代定义唯一入口。相关Current入口为高危事件后1周内，常72小时；水肿起点需分屏障通透性与左心／肺静脉压力，心衰与ARDS可并存。\n普通低流量鼻导管粗估吸入氧浓度(%)≈21+4×流量(L/min)，受呼吸型式、分钟通气和装置影响，不能套面罩、高流量或呼吸机；分级优先可靠实际设定／测定FiO₂。\n比值低表示给氧增加而动脉氧仍难升，不是单一诊断标签。",
      "required_visible_text": [
        "首选动脉血气。P/F=PaO₂（mmHg）÷FiO₂（小数），单位mmHg；例PaO₂80、FiO₂40%：80/0.40=200。\n课程必要氧合条件P/F≤300；轻200<P/F≤300，中100<P/F≤200，重≤100。200归中、100归重、300归轻。\n按Berlin版本使用须同时满足相应正压条件：PEEP≥5 cmH₂O，轻度可CPAP≥5；还须起病时间、双肺影像及水肿来源条件，不能仅凭P/F降低确诊，也不把该版本视作全部现代定义唯一入口。相关Current入口为高危事件后1周内，常72小时；水肿起点需分屏障通透性与左心／肺静脉压力，心衰与ARDS可并存。\n普通低流量鼻导管粗估吸入氧浓度(%)≈21+4×流量(L/min)，受呼吸型式、分钟通气和装置影响，不能套面罩、高流量或呼吸机；分级优先可靠实际设定／测定FiO₂。\n比值低表示给氧增加而动脉氧仍难升，不是单一诊断标签。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "先分母换小数，再300／200／100三界；把“数字条件”和Berlin其余条件同时提取。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp08",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp02",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp09-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp09"
      },
      "cue": "PAWP 鉴别阈值与可并存边界最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp09"
      ],
      "answer": "起点先分：ARDS为屏障通透性升高、富蛋白非心源渗漏；心源性肺水肿为左心／肺静脉压力升高、静水压水肿。首选鉴别检查均为心脏超声。\nCurrent课程PAWP：ARDS通常<18 mmHg，心源通常>18 mmHg；>18仍不能排除ARDS，可与心衰并存。Current没有给恰好18的独立裁决，不能添等号把它当排除线。\nSwan–Ganz心导管测肺小动脉／肺毛细血管楔压。一个楔压数值不能代替起点、心脏证据与完整背景。",
      "required_visible_text": [
        "起点先分：ARDS为屏障通透性升高、富蛋白非心源渗漏；心源性肺水肿为左心／肺静脉压力升高、静水压水肿。首选鉴别检查均为心脏超声。\nCurrent课程PAWP：ARDS通常<18 mmHg，心源通常>18 mmHg；>18仍不能排除ARDS，可与心衰并存。Current没有给恰好18的独立裁决，不能添等号把它当排除线。\nSwan–Ganz心导管测肺小动脉／肺毛细血管楔压。一个楔压数值不能代替起点、心脏证据与完整背景。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "先“屏障漏／压力高”，后“通常18两侧”；再加并存，不背成一刀切排除。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp09",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp12-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp12"
      },
      "cue": "PEEP 起始 / 目标范围与容量门槛最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp12"
      ],
      "answer": "课程PEEP从5 cmH₂O起，逐步调到8–18 cmH₂O适当范围；不是人人固定目标。\n四效：增加呼气末肺容量；重新开放萎陷肺泡／小气道；改善弥散与VA/Q、减少分流；防止每呼吸周期反复开闭。\n两条风险：压力过高→肺气压伤；胸内压↑→静脉回心↓→CO↓→血压↓。\n因此低起、看反应，血容量不足需纠正，不能只追求更高PEEP或更漂亮PaO₂。相对干肺不能利到低容量，低容量会放大PEEP回心下降，还须防痰稠与低钾低氯碱中毒。",
      "required_visible_text": [
        "课程PEEP从5 cmH₂O起，逐步调到8–18 cmH₂O适当范围；不是人人固定目标。\n四效：增加呼气末肺容量；重新开放萎陷肺泡／小气道；改善弥散与VA/Q、减少分流；防止每呼吸周期反复开闭。\n两条风险：压力过高→肺气压伤；胸内压↑→静脉回心↓→CO↓→血压↓。\n因此低起、看反应，血容量不足需纠正，不能只追求更高PEEP或更漂亮PaO₂。相对干肺不能利到低容量，低容量会放大PEEP回心下降，还须防痰稠与低钾低氯碱中毒。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "“5起／8–18课程范围”；效果记开肺、留容积、减分流、少开闭；代价分肺与循环。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp12",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp15",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp13-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp13"
      },
      "cue": "潮气量、平台压、允许性高碳酸血症与 pH 范围最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp13"
      ],
      "answer": "肺保护潮气量4–8 mL/kg预测体重PBW，绝非实际体重。平台压课程≤30 cmH₂O，Current所引ATS推荐表述<30 cmH₂O；版本符号分别保留。\nARDS损伤不均，难开病灶之外剩余baby lung更易进气；大潮气量使残余健康肺过度扩张和机械损伤。\n小潮气量可减少CO₂排出，课程容许一定CO₂潴留、pH约7.25–7.3，以可接受代价减少过度扩张。不是主动追高CO₂，也不是所有人必须达到或安全耐受的固定pH目标；同时看酸血症、颅内压、右心负荷和循环。\n肺保护由实际潮气量、平台压与反应决定。压力控制与容量控制均可做到；压力控制本身不保证潮气量安全，容量控制也不是不能限压。",
      "required_visible_text": [
        "肺保护潮气量4–8 mL/kg预测体重PBW，绝非实际体重。平台压课程≤30 cmH₂O，Current所引ATS推荐表述<30 cmH₂O；版本符号分别保留。\nARDS损伤不均，难开病灶之外剩余baby lung更易进气；大潮气量使残余健康肺过度扩张和机械损伤。\n小潮气量可减少CO₂排出，课程容许一定CO₂潴留、pH约7.25–7.3，以可接受代价减少过度扩张。不是主动追高CO₂，也不是所有人必须达到或安全耐受的固定pH目标；同时看酸血症、颅内压、右心负荷和循环。\n肺保护由实际潮气量、平台压与反应决定。压力控制与容量控制均可做到；压力控制本身不保证潮气量安全，容量控制也不是不能限压。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "按“体重基准PBW／容量／压力／可接受代价”四项提取；模式名不能替代结果。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp13",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp11",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp16-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp16"
      },
      "cue": "Ⅰ / Ⅱ型呼衰的血气边界最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp16"
      ],
      "answer": "传统判据按海平面、静息、室内空气，并记mmHg：Ⅰ型PaO₂<60且PaCO₂正常或低，主要换气障碍；Ⅱ型PaO₂<60且PaCO₂>50，主要有效肺泡通气障碍。\n已给氧须标装置／FiO₂、结合治疗前血气；PaO₂被纠正而CO₂仍高不能取消已确立通气衰竭，不要求治疗后PaO₂仍<60。\nⅠ型代表：ARDS、急PE、急肺水肿／左心衰、严重肺感染、ILD。Ⅱ型代表：严重哮喘、脑干出血、膈肌麻痹／MG、镇静催眠中毒、气管异物、COPD、脊柱侧凸／胸廓畸形。\nILD虽有“限制性通气”肺功能表现，呼衰主矛盾可为弥散／换气；COPD亦有换气障碍，但CO₂潴留显示通气失败。类型按血气与条件，不按病名固定分箱。",
      "required_visible_text": [
        "传统判据按海平面、静息、室内空气，并记mmHg：Ⅰ型PaO₂<60且PaCO₂正常或低，主要换气障碍；Ⅱ型PaO₂<60且PaCO₂>50，主要有效肺泡通气障碍。\n已给氧须标装置／FiO₂、结合治疗前血气；PaO₂被纠正而CO₂仍高不能取消已确立通气衰竭，不要求治疗后PaO₂仍<60。\nⅠ型代表：ARDS、急PE、急肺水肿／左心衰、严重肺感染、ILD。Ⅱ型代表：严重哮喘、脑干出血、膈肌麻痹／MG、镇静催眠中毒、气管异物、COPD、脊柱侧凸／胸廓畸形。\nILD虽有“限制性通气”肺功能表现，呼衰主矛盾可为弥散／换气；COPD亦有换气障碍，但CO₂潴留显示通气失败。类型按血气与条件，不按病名固定分箱。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "测量前提先说全，再“氧<60／Ⅱ再加CO₂>50”；肺功能名称与终末血气分层。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    },
    {
      "id": "a2-r12-kp17-precision",
      "anchor": {
        "block_id": "respiratory-r12",
        "kp_id": "respiratory-r12-kp17"
      },
      "cue": "慢性Ⅱ型呼衰氧疗浓度边界与急性哮喘例外最终需要精确恢复。",
      "members": [
        "respiratory-r12-kp17"
      ],
      "answer": "Ⅰ型换气失败、低氧突出，课程为高浓度给氧方向，仍按病情和目标滴定。\n慢性Ⅱ型COPD控制给氧：课程<35%；Current临床对高碳酸风险者通常先SpO₂88–92%，复查血气后调整。固定氧浓度不能代目标监测，担心CO₂不能放任严重低氧。\n过量给氧使CO₂升高的三机制：长期高CO₂后中枢适应、低氧外周驱动更重要，给氧可减少部分驱动；解除低氧性肺血管收缩→VA/Q失配加重；Haldane效应→血液释CO₂。不能缩成“全靠缺氧呼吸”。\n急性严重哮喘可为Ⅱ型，但氧疗也按病情／目标滴定，不机械套慢性COPD方案。\n传统Ⅱ型血气按室内空气PaO₂<60及PaCO₂>50 mmHg；给氧已纠正PaO₂而高CO₂持续，不取消原有通气衰竭，须结合治疗前血气、酸碱与病因。",
      "required_visible_text": [
        "Ⅰ型换气失败、低氧突出，课程为高浓度给氧方向，仍按病情和目标滴定。\n慢性Ⅱ型COPD控制给氧：课程<35%；Current临床对高碳酸风险者通常先SpO₂88–92%，复查血气后调整。固定氧浓度不能代目标监测，担心CO₂不能放任严重低氧。\n过量给氧使CO₂升高的三机制：长期高CO₂后中枢适应、低氧外周驱动更重要，给氧可减少部分驱动；解除低氧性肺血管收缩→VA/Q失配加重；Haldane效应→血液释CO₂。不能缩成“全靠缺氧呼吸”。\n急性严重哮喘可为Ⅱ型，但氧疗也按病情／目标滴定，不机械套慢性COPD方案。\n传统Ⅱ型血气按室内空气PaO₂<60及PaCO₂>50 mmHg；给氧已纠正PaO₂而高CO₂持续，不取消原有通气衰竭，须结合治疗前血气、酸碱与病因。",
        "All conditions and version distinctions are inside the exact answer. Original KP/LG ownership and complete member set remain unchanged; no splitting, new card identity, or broad-Core fallback.",
        "“课程浓度／监测目标”分开；CO₂三因按驱动、配对、血中释放记；慢COPD规则不等于所有Ⅱ型。"
      ],
      "required_core_refs": [
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp17",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        },
        {
          "system_id": "respiratory",
          "block_id": "respiratory-r12",
          "kp_id": "respiratory-r12-kp16",
          "source_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md"
        }
      ]
    }
  ],
  "unadmitted_ids": [
    "a2-r04-lg03-precision",
    "a2-r04-lg05-precision",
    "a2-r07-lg05-precision",
    "a2-r07-lg06-precision",
    "a2-r08-lg05-precision",
    "a2-r09-kp18-precision"
  ],
  "mi_d": [
    {
      "block_id": "respiratory-r01",
      "exact_topic": "TV、FRC、正常呼吸频率等数值；",
      "current_core_kp_ids": [
        "respiratory-r01-kp01",
        "respiratory-r01-kp04"
      ],
      "source_or_hold": "TV/FRC及组合现有答案；正常呼吸频率具体数值在Current Core缺失，保留Source待核，不补值。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "FEV1、FEV2、FEV3 的百分比；",
      "current_core_kp_ids": [
        "respiratory-r01-kp02"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "肺容量等于 TLC 67% 时胸廓处于自然位置；",
      "current_core_kp_ids": [
        "respiratory-r01-kp10"
      ],
      "source_or_hold": "67%是胸廓自身松弛参考位，不能无条件等于平静吸气末。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "鼻、声门、细支气管气道阻力占比；",
      "current_core_kp_ids": [
        "respiratory-r01-kp13"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "表面活性物质主要成分、胎儿分泌时间；",
      "current_core_kp_ids": [
        "respiratory-r01-kp12"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "完整舒 / 缩气道介质名单；",
      "current_core_kp_ids": [
        "respiratory-r01-kp13"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "哮喘三类药物举例；",
      "current_core_kp_ids": [
        "respiratory-r01-kp15"
      ],
      "source_or_hold": "仅三类作用接口；完整药物阶梯回R4。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r01",
      "exact_topic": "各种低频肺容量组合和特殊阈值。",
      "current_core_kp_ids": [
        "respiratory-r01-kp01",
        "respiratory-r01-kp03",
        "respiratory-r01-kp04"
      ],
      "source_or_hold": "现有组合/条件留完整Core；“各种低频/特殊”未枚举部分不臆造。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "呼吸膜六层；",
      "current_core_kp_ids": [
        "respiratory-r02-kp02"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "全肺、肺尖、肺底 VA/Q 数值；",
      "current_core_kp_ids": [
        "respiratory-r02-kp03"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "O₂ / CO₂ 各运输形式比例；",
      "current_core_kp_ids": [
        "respiratory-r02-kp05",
        "respiratory-r02-kp06"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "Hb 氧容量计算、正常氧饱和度、P50；",
      "current_core_kp_ids": [
        "respiratory-r02-kp05",
        "respiratory-r02-kp07"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "氧解离曲线全部移动因素；",
      "current_core_kp_ids": [
        "respiratory-r02-kp08"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "CO 亲和力倍数、发绀阈值；",
      "current_core_kp_ids": [
        "respiratory-r02-kp10",
        "respiratory-r02-kp11"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "PaO₂ 60 / 30 mmHg 等精确阈值；",
      "current_core_kp_ids": [
        "respiratory-r02-kp14"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "低浓度氧百分比、5% CO₂ 等 Study 数字；",
      "current_core_kp_ids": [
        "respiratory-r02-kp10",
        "respiratory-r02-kp14",
        "respiratory-r02-kp15"
      ],
      "source_or_hold": "25–30%为课程范围；5%CO₂为历史差异，不能当氧疗操作。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r02",
      "exact_topic": "长吸式呼吸低频定位。",
      "current_core_kp_ids": [
        "respiratory-r02-kp16"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "慢支“每年 3 个月、连续 2 年”；",
      "current_core_kp_ids": [
        "respiratory-r03-kp02"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "各型肺气肿的完整位置、别称和低频病因；",
      "current_core_kp_ids": [
        "respiratory-r03-kp05"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "MEFV、闭合容积、各肺容量和 DLCO 的精确组合；",
      "current_core_kp_ids": [
        "respiratory-r03-kp09",
        "respiratory-r03-kp10",
        "respiratory-r03-kp11"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "GOLD 1–4 数字；",
      "current_core_kp_ids": [
        "respiratory-r03-kp10"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "mMRC 0–4 全部表述；",
      "current_core_kp_ids": [
        "respiratory-r03-kp16"
      ],
      "source_or_hold": "课程分组与GOLD2026另标。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "A/B/E 全部药名与 ICS 指征；",
      "current_core_kp_ids": [
        "respiratory-r03-kp16",
        "respiratory-r03-kp17"
      ],
      "source_or_hold": "ICS300非独立充分指征；ABE课程/2026不混。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "长期家庭氧疗的 PaO₂、SaO₂、流量和浓度；",
      "current_core_kp_ids": [
        "respiratory-r03-kp18"
      ],
      "source_or_hold": "适应证、至少15h/d、复评与急加重滴定分开。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "AECOPD 分级、抗菌药、激素和机械通气细则；",
      "current_core_kp_ids": [
        "respiratory-r03-kp19"
      ],
      "source_or_hold": "Current有治疗类别/升级条件，没有完整抗菌药物名、剂量；缺失细则保留Source待核。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "呼吸系统体征的完整疾病名单；",
      "current_core_kp_ids": [
        "respiratory-r03-kp08",
        "respiratory-r03-kp15"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r03",
      "exact_topic": "pH 补碱门槛与全部禁忌药物。",
      "current_core_kp_ids": [
        "respiratory-r03-kp20"
      ],
      "source_or_hold": "pH<7.2不是自动补碱；抑呼吸风险不能推广成所有场景永久禁忌。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "NANC 全部舒张 / 收缩介质名单；",
      "current_core_kp_ids": [
        "respiratory-r04-kp01",
        "respiratory-r04-kp02"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "FEV1、PEF、FeNO 等精确阈值；",
      "current_core_kp_ids": [
        "respiratory-r04-kp06",
        "respiratory-r04-kp07",
        "respiratory-r04-kp09"
      ],
      "source_or_hold": "FeNO无Current数值；周PEF无公式。完整原LG cue维持HOLD。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "支气管激发剂和扩张剂代表药；",
      "current_core_kp_ids": [
        "respiratory-r04-kp07"
      ],
      "source_or_hold": "激发有醋甲胆碱/组胺；扩张剂类别见原Core，不生成剂量。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "缓解药 / 控制药完整名单；",
      "current_core_kp_ids": [
        "respiratory-r04-kp10",
        "respiratory-r04-kp12",
        "respiratory-r04-kp13",
        "respiratory-r04-kp14"
      ],
      "source_or_hold": "旧静脉茶碱与现代边界并存；不是同等默认方案。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "各型激素具体药物和给药途径；",
      "current_core_kp_ids": [
        "respiratory-r04-kp11",
        "respiratory-r04-kp16"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "SABA、LABA、SAMA、LAMA 代表药；",
      "current_core_kp_ids": [
        "respiratory-r04-kp12",
        "respiratory-r04-kp13"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "茶碱安全浓度和特殊适应证；",
      "current_core_kp_ids": [
        "respiratory-r04-kp13"
      ],
      "source_or_hold": "课程6–15mg/L；静脉急发不常规。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "白三烯调节剂特殊类型；",
      "current_core_kp_ids": [
        "respiratory-r04-kp14"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "色甘酸钠、酮替芬比较；",
      "current_core_kp_ids": [
        "respiratory-r04-kp14"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "急性发作四级全部数值；",
      "current_core_kp_ids": [
        "respiratory-r04-kp15",
        "respiratory-r04-kp16",
        "respiratory-r04-kp17"
      ],
      "source_or_hold": "急性四级与过去四周控制分级分开；Current KP15的PEF<60%分母未明，现有整条严重度Precision保持HOLD。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "奇脉疾病口诀；",
      "current_core_kp_ids": [
        "respiratory-r04-kp15"
      ],
      "source_or_hold": "列出既有六类与两个原题非典型配对；Current没有稳定独立口诀，不造口诀。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "症状控制和未来风险全部项目；",
      "current_core_kp_ids": [
        "respiratory-r04-kp17"
      ],
      "source_or_hold": "",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r04",
      "exact_topic": "生物制剂和特殊表型治疗接口。",
      "current_core_kp_ids": [
        "respiratory-r04-kp10"
      ],
      "source_or_hold": "仅生物制剂接口，无完整药物/表型治疗方案，Source/HOLD。",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "痰培养定量阈值；",
      "current_core_kp_ids": [
        "respiratory-r05-kp03"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "病原特异抗菌药完整名单；",
      "current_core_kp_ids": [
        "respiratory-r05-kp09",
        "respiratory-r05-kp10",
        "respiratory-r05-kp11",
        "respiratory-r05-kp12",
        "respiratory-r05-kp13",
        "respiratory-r05-kp14"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "病毒包涵体的胞核 / 胞质与染色；",
      "current_core_kp_ids": [
        "respiratory-r05-kp08"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "大叶性肺炎四期镜下细节；",
      "current_core_kp_ids": [
        "respiratory-r05-kp06"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "低频病毒与抗病毒药配对；",
      "current_core_kp_ids": [
        "respiratory-r05-kp14"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording. Current KP14 supports named representative drugs, oseltamivir–influenza and acyclovir–relevant herpes only; no exact low-frequency ribavirin-virus pairing is supplied.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "军团菌多种备选药物；",
      "current_core_kp_ids": [
        "respiratory-r05-kp13"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r05",
      "exact_topic": "好发部位串联中的精确肺段。",
      "current_core_kp_ids": [
        "respiratory-r05-kp16"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording. R5 retains only lobar/small-lobar distribution; R6/R7/R8 exact pulmonary segments stay at their unique existing owners.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "杵状指11种疾病；",
      "current_core_kp_ids": [
        "respiratory-r06-kp05"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "大咯血数值与止血药禁忌；",
      "current_core_kp_ids": [
        "respiratory-r06-kp08"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "铜绿假单胞菌高危条件；",
      "current_core_kp_ids": [
        "respiratory-r06-kp09"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "抗假单胞菌药物完整名单与“不能选”项；",
      "current_core_kp_ids": [
        "respiratory-r06-kp09"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "HRCT各影像征名称；",
      "current_core_kp_ids": [
        "respiratory-r06-kp06"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "不同体位误吸的精确肺段；",
      "current_core_kp_ids": [
        "respiratory-r06-kp12"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "厌氧菌和脆弱拟杆菌用药；",
      "current_core_kp_ids": [
        "respiratory-r06-kp13"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r06",
      "exact_topic": "支扩痰4层、慢性肺脓肿痰3层的当前 Study 记忆点。",
      "current_core_kp_ids": [
        "respiratory-r06-kp10"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording. Current gives sputum 4 versus 3 layers only; contents of individual layers explicitly unprovided, not invented.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "体温分度与五类热型；",
      "current_core_kp_ids": [
        "respiratory-r07-kp14",
        "respiratory-r07-kp24"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "PPD假阴性完整名单；",
      "current_core_kp_ids": [
        "respiratory-r07-kp18"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "痰涂片阳性菌量阈值；",
      "current_core_kp_ids": [
        "respiratory-r07-kp19"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "初治间歇方案；",
      "current_core_kp_ids": [
        "respiratory-r07-kp22"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "H/R/Z/S/E全部不良反应；",
      "current_core_kp_ids": [
        "respiratory-r07-kp21"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "RR/MDR A/B/C组药物清单与疗程；",
      "current_core_kp_ids": [
        "respiratory-r07-kp23"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "结核球形成来源；",
      "current_core_kp_ids": [
        "respiratory-r07-kp11"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "各肺外结核的精确形态；",
      "current_core_kp_ids": [
        "respiratory-r07-kp13"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r07",
      "exact_topic": "结核性风湿症、胸水ADA等低频接口。",
      "current_core_kp_ids": [
        "respiratory-r07-kp06",
        "respiratory-r07-kp11",
        "respiratory-r07-kp16"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "IPF 三种抗纤维化 / 抗氧化药完整名单；",
      "current_core_kp_ids": [
        "respiratory-r08-kp05"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "IPF 急性加重中抗生素、激素、氧疗、机械通气的当前讲义表述；",
      "current_core_kp_ids": [
        "respiratory-r08-kp05"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "结节病 6–24 个月疗程；",
      "current_core_kp_ids": [
        "respiratory-r08-kp08"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "结节病四期精确影像组合；",
      "current_core_kp_ids": [
        "respiratory-r08-kp08"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "各类 BALF 细胞名单；",
      "current_core_kp_ids": [
        "respiratory-r08-kp04",
        "respiratory-r08-kp07",
        "respiratory-r08-kp11",
        "respiratory-r08-kp12"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "肺泡蛋白沉着的 PAS、分层与形态称谓；",
      "current_core_kp_ids": [
        "respiratory-r08-kp10"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "过敏性肺炎的鸽子肺 / 农民肺 / 空调肺；",
      "current_core_kp_ids": [
        "respiratory-r08-kp11"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "SiO2 粒径、硅肺分期、蛋壳样钙化、浮沉实验；",
      "current_core_kp_ids": [
        "respiratory-r08-kp14",
        "respiratory-r08-kp15"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r08",
      "exact_topic": "低频原图形态与药物细节。",
      "current_core_kp_ids": [
        "respiratory-r08-kp04",
        "respiratory-r08-kp05",
        "respiratory-r08-kp07",
        "respiratory-r08-kp08",
        "respiratory-r08-kp10",
        "respiratory-r08-kp11",
        "respiratory-r08-kp12",
        "respiratory-r08-kp14",
        "respiratory-r08-kp15"
      ],
      "source_or_hold": "Topic inventory only, never a card quota. Current Core qualifications outrank older abbreviated routing wording. Low-frequency image morphology routes to the six individual original-image obligations below, with no fresh pixel-validation claim.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "右下肺动脉干、血管 / 气管比和肺动脉段凸出数字；",
      "current_core_kp_ids": [
        "respiratory-r09-kp08"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "ECG 全套电压标准与 P 波阈值；",
      "current_core_kp_ids": [
        "respiratory-r09-kp09"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "肺心病利尿剂和强心苷完整指征 / 剂量；",
      "current_core_kp_ids": [
        "respiratory-r09-kp11",
        "respiratory-r09-kp12"
      ],
      "source_or_hold": "PARTIAL_SOURCE_HOLD: Current supports KP11 small/gentle diuresis/drug names and KP12 indications plus 1/2–2/3 usual-dose proportion only. Absolute baseline/drug doses are not supplied; the unspecified full-dose component remains Source/HOLD.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "PAH 六类药及代表药；",
      "current_core_kp_ids": [
        "respiratory-r09-kp14"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "PE 危险因素完整清单；",
      "current_core_kp_ids": [
        "respiratory-r09-kp15"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "抗凝药完整名单、HIT替代、华法林重叠；",
      "current_core_kp_ids": [
        "respiratory-r09-kp20"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "抗凝疗程细分；",
      "current_core_kp_ids": [
        "respiratory-r09-kp20"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "rt-PA、UK、SK；",
      "current_core_kp_ids": [
        "respiratory-r09-kp21"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "溶栓禁忌与外部指南差异；",
      "current_core_kp_ids": [
        "respiratory-r09-kp21"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r09",
      "exact_topic": "DSA / MRPA / VQ 的低频细节。",
      "current_core_kp_ids": [
        "respiratory-r09-kp19"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "胸水比重、蛋白、细胞、葡萄糖、比值与白蛋白梯度全表；",
      "current_core_kp_ids": [
        "respiratory-r10-kp04"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "X线 300 ml、前肋分量和 D 字形包裹性积液；",
      "current_core_kp_ids": [
        "respiratory-r10-kp07"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "抽液频率、容量和并发症处理细节；",
      "current_core_kp_ids": [
        "respiratory-r10-kp08",
        "respiratory-r10-kp09",
        "respiratory-r10-kp10"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "ADA、CEA、LDH、pH、细胞计数阈值；",
      "current_core_kp_ids": [
        "respiratory-r10-kp11",
        "respiratory-r10-kp12"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "慢性脓胸术式；",
      "current_core_kp_ids": [
        "respiratory-r10-kp13"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "气胸压缩比例、胸管位置、插拔时相与拔管组合；",
      "current_core_kp_ids": [
        "respiratory-r10-kp16",
        "respiratory-r10-kp19"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "肋骨分布保护规律；",
      "current_core_kp_ids": [
        "respiratory-r10-kp20"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "急诊开胸完整口诀；",
      "current_core_kp_ids": [
        "respiratory-r10-kp23"
      ],
      "source_or_hold": "SUPPORTED_CRITERIA_WITH_UNPROVIDED_SOURCE_MNEMONIC: KP23 provides the full criteria, no actual original mnemonic. The aid is an editorial grouping only.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r10",
      "exact_topic": "所有操作类原图与低频数字。",
      "current_core_kp_ids": [
        "respiratory-r10-kp08",
        "respiratory-r10-kp19",
        "respiratory-r10-kp20",
        "respiratory-r10-kp21",
        "respiratory-r10-kp22",
        "respiratory-r10-kp23"
      ],
      "source_or_hold": "Visual inspection remains separate and unverified.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "腺癌三种特殊型及形态；",
      "current_core_kp_ids": [
        "respiratory-r11-kp03"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "鳞癌三种形态类型；不能与分化等级一一等同；",
      "current_core_kp_ids": [
        "respiratory-r11-kp04"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "小细胞癌镜下“裸核 / 假菊形团”；",
      "current_core_kp_ids": [
        "respiratory-r11-kp05"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "腺鳞癌两成分各≥10%；",
      "current_core_kp_ids": [
        "respiratory-r11-kp06"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "鼻咽癌 U002 编辑性尾部；",
      "current_core_kp_ids": [
        "respiratory-r11-kp08"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "杵状指完整疾病名单；",
      "current_core_kp_ids": [
        "respiratory-r11-kp14"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "全部异位激素—癌型配对；",
      "current_core_kp_ids": [
        "respiratory-r11-kp15"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "EGFR / ALK / ROS1 / PD-1与PD-L1指标 / 血管生成—药物配对；",
      "current_core_kp_ids": [
        "respiratory-r11-kp19"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "T1–T4、N1–N3、M1a–c细分；",
      "current_core_kp_ids": [
        "respiratory-r11-kp21",
        "respiratory-r11-kp22"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r11",
      "exact_topic": "纵隔分区解剖与代表性病变完整表。",
      "current_core_kp_ids": [
        "respiratory-r11-kp23"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "ARDS危险因素完整名单与时间窗；",
      "current_core_kp_ids": [
        "respiratory-r12-kp02"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "FiO₂估算公式、P/F分级数字；",
      "current_core_kp_ids": [
        "respiratory-r12-kp08"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "PAWP阈值与影像时相；",
      "current_core_kp_ids": [
        "respiratory-r12-kp09",
        "respiratory-r12-kp10"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "PEEP起始 / 适用范围与全部不良反应；",
      "current_core_kp_ids": [
        "respiratory-r12-kp12"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "小潮气量、平台压、允许性高碳酸血症数字；",
      "current_core_kp_ids": [
        "respiratory-r12-kp13"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "呼吸兴奋剂药名；",
      "current_core_kp_ids": [
        "respiratory-r12-kp18"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "机械通气全部并发症；",
      "current_core_kp_ids": [
        "respiratory-r12-kp21"
      ],
      "source_or_hold": "Frozen Current support; inherited external sources not newly inspected.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "pH、PaCO₂、BE、HCO₃⁻、K⁺、AB / SB完整数字表；",
      "current_core_kp_ids": [
        "respiratory-r12-kp22"
      ],
      "source_or_hold": "R12 AB/SB candidate extra definition excluded; Current only.",
      "new_card_identity": null
    },
    {
      "block_id": "respiratory-r12",
      "exact_topic": "补碱阈值及利尿剂使用边界。",
      "current_core_kp_ids": [
        "respiratory-r12-kp15",
        "respiratory-r12-kp22"
      ],
      "source_or_hold": "R12 AB/SB candidate extra definition excluded; Current only.",
      "new_card_identity": null
    }
  ],
  "readers": [
    {
      "block_id": "respiratory-r01",
      "sha256": "df59723c1e3da352c5a012a9ae0a69e5288eeb2c654c29cec99ddd89d67fe6c3"
    },
    {
      "block_id": "respiratory-r02",
      "sha256": "9000d9a650fe39164ad83e253b2304991baa328b9856ef70c8efa95388502e5a"
    },
    {
      "block_id": "respiratory-r03",
      "sha256": "4553c3ce05cbfc7c65105a112af51a64b55baf34488cec15683bd7e5c1ed29ac"
    },
    {
      "block_id": "respiratory-r04",
      "sha256": "58b87099898412a550fc3854d25c6e9547ecbe99b277cb76a5754c4ef85c8f9f"
    },
    {
      "block_id": "respiratory-r05",
      "sha256": "12226d4978b4e6c713697fbbe5e9df3612105aeac2774169203895927b1e88b4"
    },
    {
      "block_id": "respiratory-r06",
      "sha256": "14c244bfda469d1dc0ef1d82374eacde57d568fc3aa539be4c6798243a02bd6b"
    },
    {
      "block_id": "respiratory-r07",
      "sha256": "9e4aec9e32d553c6265035297101349a0c78601a02c3cab86da3b76569202152"
    },
    {
      "block_id": "respiratory-r08",
      "sha256": "d9430aa249fb40aeb82d88af2e30c835ef6b812d2f68a111a15e1cf0b312c31f"
    },
    {
      "block_id": "respiratory-r09",
      "sha256": "f74f71452adf1d93653e83c963d9b65bfada77d7350276f6992abcd00c439265"
    },
    {
      "block_id": "respiratory-r10",
      "sha256": "5dfbeb1048a55a6f39a2a51f558408c2600b4e10a8aba59d283ba64b9944e602"
    },
    {
      "block_id": "respiratory-r11",
      "sha256": "8388bd12ca9ab30654d945140de3690b764a6ecf15c0bb757ee0c67cf2ce9e1e"
    },
    {
      "block_id": "respiratory-r12",
      "sha256": "7c5e4cbbad29946e8ca742a30297a8cfac38fe4c1be1339eda2b19722d985c84"
    }
  ],
  "manifest": [
    {
      "block_id": "respiratory-r01",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "8a2a3a15e3733f2f1b08fc1cbbec3fcb90d51f72"
    },
    {
      "block_id": "respiratory-r02",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "a83808a1e3bf3a6c1d777f873bf27e4250f9dcb0"
    },
    {
      "block_id": "respiratory-r03",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "5496f8e1769cdf061a582d2f2f4ef325a23bb40d"
    },
    {
      "block_id": "respiratory-r04",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block4_支气管哮喘_可逆性气流受限_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "4da385542a0c524e780922612de0cd0d7559c4ae"
    },
    {
      "block_id": "respiratory-r05",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "f08a4e954cdc195cd599df5185d65aba550dfb07"
    },
    {
      "block_id": "respiratory-r06",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "e618604921f5735fd6631a122fc00196cdf57ee1"
    },
    {
      "block_id": "respiratory-r07",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block7_肺结核_肉芽肿空洞播散与化疗_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "19e95efa68cf98954179e9b93268ef4f09d8bb20"
    },
    {
      "block_id": "respiratory-r08",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "9e0b91de8ca970455246b67ca39d3510209a413d"
    },
    {
      "block_id": "respiratory-r09",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "c546c3c6f2cde391da35034f64c97c0829100c0c"
    },
    {
      "block_id": "respiratory-r10",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "5dd3fd247775b510276f0664dc4b279aed28da57"
    },
    {
      "block_id": "respiratory-r11",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "dc7c8e10205e9c9eef7f11b1a15ac4f98d49aaaa"
    },
    {
      "block_id": "respiratory-r12",
      "canonical_path": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md",
      "canonical_git_blob": "d84b136358035e7a5ff3b3a8c6291cec5103c62b"
    }
  ],
  "frozen_source_owners": [
    {
      "path": "content/xizong/knowledge/systems/a2-respiratory/system.json",
      "ref": "ce079966ebce7a95fe9a58b174a412f9f033fd3b",
      "where": "main",
      "sha": "a3891afba79080fd721c20e5add0e65988ae72f3",
      "verified_git_blob": "a3891afba79080fd721c20e5add0e65988ae72f3",
      "sha256": "9afb592095741944a2b4f1da98b34e4e50779c4de5002a160ef68f2e01382b08",
      "bytes": 20478
    },
    {
      "path": "content/xizong/knowledge/learner/a2-respiratory-learning.json",
      "ref": "ce079966ebce7a95fe9a58b174a412f9f033fd3b",
      "where": "main",
      "sha": "783171737dd12066fdb27db9856807724aef3965",
      "verified_git_blob": "783171737dd12066fdb27db9856807724aef3965",
      "sha256": "56fc1323d9d3c33e670a95bf690f072fbae5ccd3dc3fdbb3be764044656312d6",
      "bytes": 21185
    }
  ],
  "old_shared_value_digest": "ca94e683156f44224047dedee6ba93378ee1b3a6a8b8f0a734f27c522bfaae33",
  "old_a1_index_digest": "16acb1aad524712b718f4d8bfb377e96c0c6733d639f97d082fbece6d7a05bfb",
  "old_a1_native_descriptors": [
    {
      "blockId": "circulation-b01",
      "descriptor_digest": "8253884a18514de30a2fb52ffd8c293d66c39b513ef88ea8b43b2914d9f678a6"
    },
    {
      "blockId": "circulation-b02",
      "descriptor_digest": "ec4b00f1bb3e6563cb31237f93fe5a6f29186b7f9bb0494037f5756a9ff7eb5a"
    },
    {
      "blockId": "circulation-b03",
      "descriptor_digest": "93fc9f4daafadbb3ef60793728749688234e626a9da5b18e583e7d2a5dae6ce5"
    },
    {
      "blockId": "circulation-b04",
      "descriptor_digest": "0c4e68bad9436134252c8afc88b4ff0de94ef1dcb47e5fabcc8de6b88be7f14f"
    },
    {
      "blockId": "circulation-b05",
      "descriptor_digest": "3fea94beb83216e6b651e3ed9b085044e7bcb582c50e5c0960088feba5a9233a"
    },
    {
      "blockId": "circulation-b06",
      "descriptor_digest": "baafaefa62485dfd8f8197a8dd06372dc249c2b105fa93faec4732252aca18e2"
    },
    {
      "blockId": "circulation-b07",
      "descriptor_digest": "584c1fd7fd47d04573225ec4c5948302413da878cd54d31aa5d5f84190855c8b"
    },
    {
      "blockId": "circulation-b08",
      "descriptor_digest": "a646d96b47332d7d1c32101e21da161f631ebae5c4c8e60bd543b97437ce2510"
    },
    {
      "blockId": "circulation-b09",
      "descriptor_digest": "d615854e10fda2808875e167eec483edceedc7ccb322bebaf7b2fe7b8aa23c06"
    },
    {
      "blockId": "circulation-b10",
      "descriptor_digest": "52f3525b1da296b29f43bf027042572402a6d7289658b1277a3ce2e9e6a79f48"
    },
    {
      "blockId": "circulation-b11",
      "descriptor_digest": "07f36a0fd1ccfa13a8cad46e00ef5260eebf1e1229f1a56cdd051a4f7ef52512"
    },
    {
      "blockId": "circulation-b12",
      "descriptor_digest": "e3b3bc799182b335e4736c8f74ee62fb89742421129029badb1857b51969a139"
    }
  ]
};
export const index=read(root+'/content/xizong/knowledge/learner/a2-respiratory-learning-cues.json'),shared=read(root+'/content/xizong/knowledge/learner/shared-fields.json');
export const clone=x=>JSON.parse(JSON.stringify(x));const sha=b=>createHash('sha256').update(b).digest('hex');const blob=b=>createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex');const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tracked=['xizongLearningCues','xizongMemoryRelease','xizongMemoryModel','xizongMemoryAutoRelease','xizongLearnerObject','xizongRevisionWitness'];const hashes=()=>Object.fromEntries(tracked.map(n=>[n,sha(fs.readFileSync(`${root}/static-web/src/lib/${n}.mjs`))]));const beforeHashes=hashes();const checks=[],failures=[];
const check=(name,fn)=>{try{fn();checks.push(name)}catch(e){failures.push({name,error:e.stack})}};
export const blocks=new Map(),objects=new Map(),descriptors=new Map(),resolved=new Map(),productions=new Map();
const loadedCues=cues.loadXizongLearningCues(native.loadXizongSystem('respiratory'));
for(let n=1;n<=12;n++){const raw=native.loadXizongBlock('respiratory',`r${String(n).padStart(2,'0')}`);blocks.set(raw.blockId,raw);const b=production.buildXizongProductionBlock(raw);productions.set(raw.blockId,b);const lc=cues.learningCuesForBlock(loadedCues,b);resolved.set(raw.blockId,lc);const o=learner.buildXizongLearnerObject({block:b,learningCues:lc});o.revisionWitness=revision.buildXizongRevisionWitness(o);objects.set(raw.blockId,o);if(oracle.accepted.some(x=>x.anchor.block_id===raw.blockId))descriptors.set(raw.blockId,release.buildXizongPreparedMemoryAvailability(o));}
export const allCue=o=>[...o.kps.flatMap(k=>k.precision||[]),...o.logicGroups.flatMap(g=>g.precision||[])];
const stripRef=r=>{const x=clone(r);delete x.prepared_memory_ref;return x};
check('all 32 original index rows, 17 visuals, anchors and cues are byte-value preserved',()=>{assert.deepEqual(index.precision_index.map(stripRef),oracle.original_index.precision_index);assert.deepEqual(index.visual_bindings,oracle.original_index.visual_bindings);});
check('admission IDs exactly equal reviewed content set, with no conditional/held admission',()=>{assert.deepEqual(index.precision_index.filter(x=>x.prepared_memory_ref).map(x=>x.id),oracle.accepted.map(x=>x.id));assert.deepEqual([...descriptors.values()].flatMap(x=>x.precisionCards.map(c=>c.id)).sort(),oracle.accepted.map(x=>'precision:'+x.id).sort());});
check('all 32 native ownership arrays match independent reviewed membership',()=>{for(const x of oracle.all_cues){const b=blocks.get(x.anchor.block_id);const ids=x.anchor.kp_id?[x.anchor.kp_id]:b.logicGroups.find(g=>g.groupId===x.anchor.logic_group_id)?.kpIds;assert.deepEqual(ids,x.original_member_kp_ids,x.id)}});
check('all accepted readers are exact frozen reviewed bytes',()=>{for(const x of oracle.readers){const n=x.block_id.slice(-2);assert.equal(sha(fs.readFileSync(`${root}/content/xizong/projection/a2-respiratory/chat/b${n}-teaching.md`)),x.sha256,x.block_id)}});
check('all 12 Current canonical bodies retain 111 exact MI-D destinations across model/Prompt packaging changes',()=>{const m={blocks:oracle.manifest};for(const b of m.blocks){const source=fs.readFileSync(`${root}/${b.canonical_path}`,'utf8');if(!assertReviewedA2Source(source,b.block_id,b.canonical_git_blob))assert.equal(blob(Buffer.from(beforePromptCalibration(source))),b.canonical_git_blob,b.block_id);}for(const t of oracle.mi_d){const b=m.blocks.find(x=>x.block_id===t.block_id);assert.ok(fs.readFileSync(`${root}/${b.canonical_path}`,'utf8').includes(t.exact_topic));for(const id of t.current_core_kp_ids)assert.ok(blocks.get(t.block_id).kpRecords.some(k=>k.kpId===id));assert.ok(t.current_core_kp_ids.length||t.source_or_hold);assert.equal(t.new_card_identity,null);}});
check('A2 preserves old System/Learning values outside twenty-five explicitly reviewed model fields and retains real dependent revisions',()=>{
 for(const x of oracle.frozen_source_owners){const source=fs.readFileSync(`${root}/${x.path}`,'utf8');assert.equal(blob(Buffer.from(x.path.endsWith('a2-respiratory-learning.json')?a2LearningBeforeModelReview(source):source)),x.verified_git_blob,x.path);}
 const cueSource=fs.readFileSync(`${root}/content/xizong/knowledge/learner/a2-respiratory-learning-cues.json`,'utf8');
 assert.equal(sha(a2CuesBeforeOwnerReview(cueSource)),'2f0a98308cd05ba15c968fae934aeab5c953d5ed8ec81487e59a6a157e7edb4e');
 const prior=read(new URL('./fixtures/a3-independent-review.json',import.meta.url)).baseline_native.systems.respiratory;
 for(const id of descriptors.keys()){const d=descriptors.get(id),unchanged=clone(d);assertPreparedDescriptorAfterModelReview(d,fs.readFileSync(`${root}/${blocks.get(id).sourcePath}`,'utf8'),prior.find(x=>x.blockId===id).prepared_sha256);assert.deepEqual(d,unchanged,'review assertion must not rewrite actual revisions');}
});
check('old shared owner fields and all A1 rows are unchanged without extra A2 stores',()=>{const actual=clone(shared);for(const x of oracle.accepted){assert.ok(actual.precision_fields[x.id]);delete actual.precision_fields[x.id];}for(const b of new Set(oracle.accepted.flatMap(x=>x.required_core_refs.map(r=>r.block_id))))delete actual.source_bindings[b];
// The exact independently reviewed A3 additions are outside this pre-A2 snapshot.
// Never strip a prefix or alter the original legacy digest / old-owner values.
const a3=read(new URL('./fixtures/a3-independent-review.json',import.meta.url));
for(const row of a3.accepted)delete actual.precision_fields[row.proposed_new_precision_id];
for(const b of new Set(a3.accepted.flatMap(x=>x.required_core_refs.map(r=>r.block_id))))if(!a3.original_source_binding_keys.includes(b))delete actual.source_bindings[b];
// Remove only exact separately reviewed B additions when reconstructing this
// historical pre-tranche owner. Unknown additions and every old value remain
// covered by the original frozen digest; never strip an ID prefix.
const bReview=read(new URL('./fixtures/b-reviewed-native-memory.json',import.meta.url));
const preB=read(new URL('./fixtures/b-pre-admission-baseline.json',import.meta.url));
for(const row of bReview.accepted){assert.deepEqual(actual.precision_fields[row.id],row.item);delete actual.precision_fields[row.id];}
for(const row of bReview.accepted)for(const ref of row.item.retention_metadata.required_core_refs){
 if(!Object.hasOwn(preB.shared_entries.source_bindings,ref.block_id)){
  if(Object.hasOwn(actual.source_bindings,ref.block_id)){assert.equal(actual.source_bindings[ref.block_id],ref.source_path);delete actual.source_bindings[ref.block_id];}
 }
}
// Reconstruct only the explicit B1 archival renames, preserving every frozen
// historical byte-value. Current semantic Core/card equality is checked below.
const orientation=actual.block_fields['circulation-b01'];
assert.ok(!Object.hasOwn(orientation,'initial_orientation'));
orientation.initial_orientation=orientation.historical_initial_orientation;delete orientation.historical_initial_orientation;
for(let n=1;n<=32;n++){
 const fields=actual.kp_fields[`circulation-b01-kp${String(n).padStart(3,'0')}`]?.retention_metadata;
 if(!fields)continue;
 for(const key of ['memory_items','gate_knowledge'])if(Object.hasOwn(fields,'historical_'+key)){
  assert.ok(!Object.hasOwn(fields,key));fields[key]=fields['historical_'+key];delete fields['historical_'+key];
 }
}
assert.equal(cues.preparedMemoryDigest(actual),oracle.old_shared_value_digest);
const a1=read(root+'/content/xizong/knowledge/learner/a1-circulation-learning-cues.json');
const b1=native.loadXizongBlock('circulation','circulation-b01');
const relocated=a1.precision_index.filter(row=>row.prepared_memory_ref?.collection==='canonical_exact_items');
assert.equal(relocated.length,13);
for(const row of relocated){
 assert.equal(row.anchor.block_id,b1.blockId);assert.equal(row.prepared_memory_ref.source_path,b1.sourcePath);
 assert.ok(!Object.hasOwn(row,'cue'));
 const fieldKey='circulation-b01-kp'+row.anchor.kp_id.slice(-2).padStart(3,'0');
 const item=actual.kp_fields[fieldKey].retention_metadata.memory_items.find(item=>item.memory_id===row.prepared_memory_ref.memory_id);
 const canonical=b1.knowledge.exact_items.find(value=>value.item.memory_id===item.memory_id);
 const resolvedItem={...canonical.item,answer:native.resolveXizongKnowledgeView(b1,canonical.answer_view)};
 if(canonical.anchor_field==='anchor')resolvedItem.anchor=native.resolveXizongKnowledgeView(b1,canonical.anchor_views[0]);
 else if(canonical.anchor_field==='anchors')resolvedItem.anchors=canonical.anchor_views.map(view=>native.resolveXizongKnowledgeView(b1,view));
 assert.deepEqual(resolvedItem,item);assert.equal(canonical.kp_ordinal,Number(row.anchor.kp_id.slice(-2)));
 row.cue=item.cue;
 row.prepared_memory_ref={kp_field_key:fieldKey,collection:'memory_items',memory_id:item.memory_id,
  kp_core_sha256:cues.preparedMemoryDigest(b1.kpRecords.find(k=>k.kpId===row.anchor.kp_id).detailMarkdown),item_sha256:cues.preparedMemoryDigest(item)};
}
assert.equal(cues.preparedMemoryDigest(a1),oracle.old_a1_index_digest);});
check('every exact answer/qualification/aid is retained and reaches Reveal once',()=>{for(const x of oracle.accepted){const item=shared.precision_fields[x.id],row=index.precision_index.find(r=>r.id===x.id),ref=row.prepared_memory_ref,o=objects.get(x.anchor.block_id),cue=allCue(o).find(r=>r.id===x.id),card=descriptors.get(x.anchor.block_id).precisionCards.find(c=>c.precisionCueId===x.id);assert.equal(item.answer,x.answer,x.id);assert.deepEqual(item.retention_metadata.native_owner,{system_id:'respiratory',canonical_id:'A2',anchor:x.anchor});assert.deepEqual(item.retention_metadata.required_core_refs,x.required_core_refs);assert.deepEqual(ref.owner_kp_ids,x.members);assert.deepEqual(ref.core_refs.map(({kp_core_sha256,...r})=>r),x.required_core_refs);assert.equal(ref.item_sha256,cues.preparedMemoryDigest(item));for(const r of ref.core_refs){const b=blocks.get(r.block_id),kp=b.kpRecords.find(k=>k.kpId===r.kp_id);assert.equal(r.source_path,b.sourcePath);assert.equal(r.kp_core_sha256,cues.preparedMemoryDigest(kp.detailMarkdown));}assert.ok(card&&cue);for(const text of x.required_visible_text)assert.ok(card.answerHtml.includes(escape(text)),x.id+' missing visible: '+text);assert.equal(card.answerHtml.split(escape(x.answer)).length-1,1);assert.equal(card.answerHtml,cue.raw.answer_html);assert.equal(cue.answerBearing,true);assert.equal(cue.displayPolicy.timing,'POST_REVEAL');for(const stage of ['KP_RECALL_FRONT','BLOCK_RECALL_FRONT'])assert.equal(repr.resolveXizongLearnerAssetRepresentation(cue,{stage}).visible,false);assert.equal(repr.resolveXizongLearnerAssetRepresentation(cue,{stage:'KP_RECALL_REVEALED'}).visible,true);assert.equal(card.kpId,x.anchor.kp_id||'');if(x.anchor.logic_group_id)assert.equal(card.logicGroupId,x.anchor.logic_group_id);}});
check('zero-ref Blocks R4/R7 unsupported and all descriptors omit held awareness cues',()=>{for(const [id,o] of objects){const expected=oracle.accepted.filter(x=>x.anchor.block_id===id).map(x=>'precision:'+x.id).sort();if(!expected.length){assert.equal(release.supportsXizongPreparedMemoryBlock(id),false);assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o));}for(const d of [release.buildXizongMemoryReleaseDescriptorFromLearnerObject(o),release.buildXizongBlockMemoryReleaseDescriptor(productions.get(id),resolved.get(id))])assert.deepEqual(d.precisionCards.map(x=>x.id).sort(),expected)}});
const getRow=id=>clone(index.precision_index.find(x=>x.id===id));
function mutation(id,name,change){check(name,()=>{const row=getRow(id),localBlocks=new Map([...blocks].map(([k,v])=>[k,clone(v)])),block=localBlocks.get(row.anchor.block_id),input=clone(shared),options={loadBlock:(s,b)=>{assert.equal(s,'respiratory');return localBlocks.get(b)}};change({row,ref:row.prepared_memory_ref,item:input.precision_fields[id],block,input,localBlocks,options});assert.throws(()=>cues.resolvePreparedMemoryCue(row,block,input,options),/CURRENT_XIZONG_PREPARED_MEMORY_/);});}
for(const x of oracle.accepted){for(const dep of x.required_core_refs){mutation(x.id,`${x.id}: stale entire native Core ${dep.kp_id} rejects`,({localBlocks})=>localBlocks.get(dep.block_id).kpRecords.find(k=>k.kpId===dep.kp_id).detailMarkdown+='\nINDEPENDENT_STALE_CORE');}}
for(const [id,bid,kpid] of [['a2-r02-lg04-precision','respiratory-r02','respiratory-r02-kp05'],['a2-r01-kp02-precision','respiratory-r03','respiratory-r03-kp06']]){
 for(const f of ['title','prompt','sourceLocator','outlineLocator','groupId','groupLabel','ordinal','contentDiagnostics'])mutation(id,`${id}: nonmember metadata-only ${f} rejects`,({localBlocks})=>{const k=localBlocks.get(bid).kpRecords.find(k=>k.kpId===kpid);k[f]=f==='contentDiagnostics'?['INDEPENDENT_REQUIRED_METADATA_ERROR']:f==='ordinal'?999:String(k[f]||'')+' INDEPENDENT_CHANGE';});
 for(const f of ['firstPassFocus','stopLine','recallSpine','systemSourcePath','learningSupportSourcePath','systemCanonicalId'])mutation(id,`${id}: dependency Block ${f} rejects`,({localBlocks})=>localBlocks.get(bid)[f]+=' INDEPENDENT_CHANGE');
}
for(const [name,change] of [
 ['LG reanchored to member KP',({row})=>{row.anchor.kp_id='respiratory-r02-kp07';delete row.anchor.logic_group_id;}],
 ['LG dual owner anchor',({row})=>row.anchor.kp_id='respiratory-r02-kp07'],
 ['wrong LG same members',({row,block})=>{const g=clone(block.logicGroups.find(g=>g.groupId===row.anchor.logic_group_id));g.groupId+='-wrong';block.logicGroups.push(g);row.anchor.logic_group_id=g.groupId;}],
 ['item owner changed',({item})=>item.retention_metadata.native_owner.anchor.logic_group_id='wrong'],
 ['missing native owner',({item})=>delete item.retention_metadata.native_owner],
 ['member omitted',({ref})=>ref.owner_kp_ids.pop()],['member reordered',({ref})=>ref.owner_kp_ids.reverse()],
 ['member added in native',({block,row})=>block.logicGroups.find(g=>g.groupId===row.anchor.logic_group_id).kpIds.push('respiratory-r02-kp05')],
 ['member removed in native',({block,row})=>block.logicGroups.find(g=>g.groupId===row.anchor.logic_group_id).kpIds.pop()],
 ['LG deleted',({block,row})=>block.logicGroups=block.logicGroups.filter(g=>g.groupId!==row.anchor.logic_group_id)],
 ['duplicate native dependency KP',({block})=>block.kpRecords.push(clone(block.kpRecords.find(k=>k.kpId==='respiratory-r02-kp05')))],
 ['duplicate native group',({block,row})=>block.logicGroups.push(clone(block.logicGroups.find(g=>g.groupId===row.anchor.logic_group_id)))],
 ['unknown mode',({ref})=>ref.owner_mode='UNKNOWN'],['mixed legacy KP field',({ref})=>ref.kp_field_key='respiratory-r02-kp007'],
 ['mixed retained source refs',({ref})=>ref.source_memory_refs=[]],['mixed primary core hash',({ref})=>ref.kp_core_sha256='stale'],
 ['empty Core hash',({ref})=>ref.core_refs[0].kp_core_sha256=''],['missing Core hash',({ref})=>delete ref.core_refs[0].kp_core_sha256],
 ['extra Core key',({ref})=>ref.core_refs[0].unreviewed='value'],['missing Core array',({ref})=>delete ref.core_refs],
 ['drop nonmember Core ref',({ref})=>ref.core_refs.pop()],['reorder Core refs',({ref})=>ref.core_refs.reverse()],
 ['duplicate Core ref',({ref})=>ref.core_refs.push(clone(ref.core_refs[0]))],['wrong Core path',({ref})=>ref.core_refs[0].source_path='wrong'],
 ['wrong cue ID',({row})=>row.id='a2-r02-kp03-precision'],['cue changed',({row})=>row.cue+='changed'],
 ['parallel answer',({row})=>row.answer_html='<p>unapproved</p>'],['answer changed',({item})=>item.answer+='changed'],
 ['scope dropped',({item})=>delete item.answer_scope],['aid changed',({item})=>item.mnemonic='changed'],
 ['required dependency dropped',({item})=>item.retention_metadata.required_core_refs.pop()],
 ['mixed source item semantics',({item,ref})=>{item.retention_metadata.source_memory_ids=['fake'];ref.item_sha256=cues.preparedMemoryDigest(item);}]
])mutation('a2-r02-lg04-precision',name,change);
for(const f of ['order','label','membershipMode','kpOrdinals','kpCount','jobs','goal','closure','visualRequired','visualSourceState','continuityRationale','receiptAnchor','start','end'])mutation('a2-r02-lg04-precision','native LG '+f+' change rejects',({block,row})=>{let g=block.logicGroups.find(g=>g.groupId===row.anchor.logic_group_id);g[f]=Array.isArray(g[f])?[...g[f],'INDEPENDENT']:typeof g[f]==='number'?g[f]+100:typeof g[f]==='boolean'?!g[f]:String(g[f]||'')+' INDEPENDENT';});
for(const [name,change] of [['lookup missing',({options})=>options.loadBlock=()=>null],['lookup throws',({options})=>options.loadBlock=()=>{throw Error('unavailable')}],['source binding missing',({input})=>delete input.source_bindings['respiratory-r03']]])mutation('a2-r01-kp02-precision',name,change);
function reversed(x){return Array.isArray(x)?x.map(reversed):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).reverse().map(k=>[k,reversed(x[k])])):x;}
for(const [bid,id] of [['respiratory-r01','a2-r01-kp02-precision'],['respiratory-r02','a2-r02-lg04-precision']]){
 check(id+': JSON roundtrip and arbitrary object key order stay valid',()=>{assert.deepEqual(release.buildXizongPreparedMemoryAvailability(reversed(clone(objects.get(bid)))),descriptors.get(bid));const row=reversed(getRow(id));assert.ok(cues.resolvePreparedMemoryCue(row,reversed(clone(blocks.get(bid))),reversed(clone(shared))).answer_html)});
 for(const [name,change] of [['nested missing hash',c=>delete c.raw.prepared_memory_ref.core_refs[0].kp_core_sha256],['nested extra key',c=>c.raw.prepared_memory_ref.core_refs[0].unreviewed=1],['missing nonmember reference',c=>c.raw.prepared_memory_ref.core_refs.pop()],['reference wrong owner',c=>c.raw.prepared_memory_ref.owner_kp_ids=['wrong']],['raw wrong anchor',c=>c.raw.anchor={block_id:bid,kp_id:'wrong'}],['outer wrong anchor',c=>c.anchor={block_id:bid,kp_id:'wrong'}],['outer cue changed',c=>c.cue+='changed'],['missing exact body',c=>{c.answerHtml='';c.raw.answer_html=''}],['outer answer diverges from resolved raw',c=>c.answerHtml='<section data-prepared-memory="'+id+'">swapped body</section>']])check(`${id}: consumer ${name} fails`,()=>{const o=clone(objects.get(bid));change(allCue(o).find(c=>c.id===id));assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o),/CURRENT_XIZONG_MEMORY_RELEASE_/)});
 check(id+': duplicate cue across KP/LG arrays fails',()=>{const o=clone(objects.get(bid)),c=clone(allCue(o).find(c=>c.id===id));o.kps[0].precision.push(c);assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o),/CURRENT_XIZONG_MEMORY_RELEASE_/)});
}
check('wrong LG with identical members cannot pass learner consumer',()=>{const o=clone(objects.get('respiratory-r02')),g=o.logicGroups.find(g=>g.identity.logicGroupId==='respiratory-r02-lg04');g.identity.logicGroupId='wrong';assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o),/CURRENT_XIZONG_MEMORY_RELEASE_/)});
check('card-only opening creates exact 26 cards and no source/learning/release/debt/evidence state',()=>{let s=memory.createXizongMemoryState();for(const d of descriptors.values()){assert.deepEqual(d.coreCards,[]);assert.deepEqual(d.attentionSignals,[]);assert.deepEqual(d.promptOverrides,{});assert.deepEqual(d.markedFragments,[]);s=memory.makePreparedMemoryAvailable(s,d,'2026-10-06');}assert.deepEqual(Object.keys(s.cards).sort(),oracle.accepted.map(x=>'precision:'+x.id).sort());assert.equal(memory.todayMemoryQueue(s).length,0);for(const k of ['evidence','repairTasks'])assert.deepEqual(s[k],[]);for(const k of ['releasedBlocks','marks','promptOverrides','attention'])assert.deepEqual(s[k],{});});
for(const [name,change] of [['wrong LG',c=>c.logicGroupId='wrong'],['LG to KP',c=>c.kpId='respiratory-r02-kp07'],['wrong system',c=>c.systemId='other'],['wrong canonical',c=>c.canonicalId='A1'],['wrong Block',c=>c.blockId='respiratory-r01']])check('history rejects '+name+' with no state mutation',()=>{const d=descriptors.get('respiratory-r02'),s=memory.makePreparedMemoryAvailable(memory.createXizongMemoryState(),d),id='precision:a2-r02-lg04-precision';change(s.cards[id]);const prior=clone(s);assert.throws(()=>memory.makePreparedMemoryAvailable(s,d),/OWNER_CHANGED/);assert.deepEqual(s,prior)});
for(const id of ['a2-r01-kp01-precision','a2-r02-lg04-precision'])check(id+': same-owner refresh retains evidence, old answer history and unrelated state',()=>{const row=oracle.accepted.find(x=>x.id===id),d=descriptors.get(row.anchor.block_id);let s=memory.makePreparedMemoryAvailable(memory.createXizongMemoryState(),d,'2026-10-01');s=memory.appendMemoryEvidence(s,{cardId:'precision:'+id,rating:'mastered'},'2026-10-01');Object.assign(s,{marks:{other:{text:'keep'}},promptOverrides:{other:'keep'},releasedBlocks:{other:{releasedAt:'keep'}},repairTasks:[{id:'keep'}],attention:{other:{reviewRequested:true}}});const before=clone(s),nextD=clone(d),c=nextD.precisionCards.find(c=>c.id==='precision:'+id);c.answerHtml+='<p>re-reviewed</p>';c.semanticRevision+='changed';const next=memory.makePreparedMemoryAvailable(s,nextD,'2026-10-02');for(const k of ['marks','promptOverrides','releasedBlocks','repairTasks','attention','evidence'])assert.deepEqual(next[k],before[k]);assert.deepEqual(s,before);assert.equal(next.cards[c.id].contentHistory.at(-1).answerHtml,before.cards[c.id].answerHtml);assert.deepEqual(memory.makePreparedMemoryAvailable(next,nextD),next);});
check('each later complete Block releases Core once and only accepted exact Precision subset',()=>{for(const [id] of objects){const o=compiler.resolveXizongLearnerProjection({systemId:'respiratory',blockId:id}).learnerObject;let state=memory.createXizongMemoryState();if(descriptors.has(id))state=memory.makePreparedMemoryAvailable(state,descriptors.get(id));const study={sourceHash:o.sourceHash,completed:true,blockRecallDone:true,learned:Object.fromEntries(o.kps.map(k=>[k.identity.kpId,true])),ratings:Object.fromEntries(o.kps.map(k=>[k.identity.kpId,'fuzzy']))};const r=auto.releaseCompletedBlockToMemory(state,o,study);assert.equal(r.released,true);assert.equal(r.coreCardIds.length,o.kps.length);assert.deepEqual(r.precisionCardIds.sort(),oracle.accepted.filter(x=>x.anchor.block_id===id).map(x=>'precision:'+x.id).sort());assert.equal(auto.releaseCompletedBlockToMemory(r.state,o,study).released,false)}});
check('A1 prepared identities stay exact while Block packaging may change',()=>{const old=oracle.old_a1_native_descriptors,lc=cues.loadXizongLearningCues(native.loadXizongSystem('circulation'));for(const x of old){if(x.blockId==='circulation-b01'){
// Whole descriptor locator/model packaging moved; retain the independent
// semantic card golden instead of re-signing the historical descriptor.
const o=compiler.resolveXizongLearnerProjection({systemId:'circulation',blockId:x.blockId}).learnerObject;
const cards=release.buildXizongPreparedMemoryAvailability(o).precisionCards;assert.equal(cards.length,13);
assert.equal(sha(JSON.stringify(cards.map(c=>Object.fromEntries(['id','precisionCueId','kpId','answerHtml','semanticRevision'].map(k=>[k,c[k]]))))),'0af414c1310ec3e53c91d2eb3dce3804d76a4d02dc2d3b2cd107413e598f9144');continue;}const b=production.buildXizongProductionBlock(native.loadXizongBlock('circulation',x.blockId));const o=learner.buildXizongLearnerObject({block:b,learningCues:cues.learningCuesForBlock(lc,b)});o.revisionWitness=revision.buildXizongRevisionWitness(o);const d=release.buildXizongPreparedMemoryAvailability(o);assert.equal(cues.preparedMemoryDigest(descriptorAtFrozenPackaging(d,fs.readFileSync(`${root}/${b.sourcePath}`,'utf8'))),x.descriptor_digest,x.blockId)}});
check('production controller files stable across independent execution',()=>assert.deepEqual(hashes(),beforeHashes));
const report={status:failures.length?'FAIL':'PASS',scope:'Independent frozen content oracle, actual native modules, injected mutation fixtures and synthetic learner state. No browser, source-pixel or served-release claim.',sha256:beforeHashes,checks,failures};fs.writeFileSync(out+'/xizong-a2-system-prepared-memory.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:checks.length,failures},null,2));if(failures.length)process.exitCode=1;
