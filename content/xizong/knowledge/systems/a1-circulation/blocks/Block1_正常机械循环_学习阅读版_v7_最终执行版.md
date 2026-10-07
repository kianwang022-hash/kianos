<!-- kianos:knowledge
{
  "block_id": "circulation-b01",
  "logic_groups": [
    {
      "groupId": "circulation-b01-lg01",
      "label": "心动周期：压力—瓣膜—容积",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        1,
        2,
        3
      ]
    },
    {
      "groupId": "circulation-b01-lg02",
      "label": "搏出量、负荷与心输出量",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        4,
        5,
        6,
        7,
        8
      ]
    },
    {
      "groupId": "circulation-b01-lg03",
      "label": "充盈、储备与泵功能评价",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        9,
        10,
        11,
        12,
        13
      ]
    },
    {
      "groupId": "circulation-b01-lg04",
      "label": "PV环、功能曲线与瓣膜时相验证",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        14,
        15,
        16
      ]
    },
    {
      "groupId": "circulation-b01-lg05",
      "label": "动脉压力、阻力与血管分工",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        17,
        18,
        19,
        20,
        21,
        22
      ]
    },
    {
      "groupId": "circulation-b01-lg06",
      "label": "静脉回心与微循环交换",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        23,
        24,
        25,
        26
      ]
    },
    {
      "groupId": "circulation-b01-lg07",
      "label": "冠脉自供与氧供需接口",
      "membershipMode": "SYSTEM_RANGE",
      "kpOrdinals": [
        27,
        28,
        29,
        30,
        31,
        32
      ]
    }
  ],
  "fragments": {
    "kp03.time": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*时间\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp03.aortic_pressure": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*主动脉压\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp03.left_ventricular_pressure": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*左室压\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp03.pressure_speed": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*室压变化速度\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp03.flow_extrema": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*血量\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp03.volume_extrema": {
      "kp_ordinal": 3,
      "pattern": "^- \\*\\*心室容积\\*\\*\\n((?:  - [^\\n]+(?:\\n|$)){2})",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp04.normal_value": {
      "kp_ordinal": 4,
      "pattern": "约 (\\*\\*[^*]+\\*\\*)。",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp08.normal_value": {
      "kp_ordinal": 8,
      "pattern": "约 (\\*\\*[^*]+\\*\\*)。",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp08.threshold": {
      "kp_ordinal": 8,
      "pattern": "^- \\*\\*HR (>[^*]+)\\*\\*",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp09.filling_parts": {
      "kp_ordinal": 9,
      "pattern": "^- \\*\\*心室充盈[^\\n]*\\n((?:  - [^\\n]+(?:\\n|$)){2})",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp11.relative_work": {
      "kp_ordinal": 11,
      "pattern": "\\*\\*(右室做功约为左室的 ([^*]+))\\*\\*",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp11.work_ratio": {
      "kp_ordinal": 11,
      "pattern": "\\*\\*右室做功约为左室的 ([^*]+)\\*\\*",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp12.normal_value": {
      "kp_ordinal": 12,
      "pattern": "正常约 (\\*\\*[^*]+\\*\\*)。",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp17.capacity": {
      "kp_ordinal": 17,
      "pattern": "^- \\*\\*容量血管\\*\\*：[^\\n]*容纳约 ([^ ]+) 血量。",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp17.pathology_map": {
      "kp_ordinal": 17,
      "pattern": "^- \\*\\*病理学“细动脉”\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp20.normal_value": {
      "kp_ordinal": 20,
      "pattern": "^- \\*\\*PP[^\\n]*正常约 ([^。]+)。",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp21.peaks": {
      "kp_ordinal": 21,
      "pattern": "^- \\*\\*两个高峰\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp21.rhythm": {
      "kp_ordinal": 21,
      "pattern": "^- \\*\\*昼夜节律\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp23.normal_value": {
      "kp_ordinal": 23,
      "pattern": "^- \\*\\*正常值\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route0.name": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*(迂回/营养通路)\\*\\*$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route0.distribution": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*迂回/营养通路\\*\\*\\n(?:  - [^\\n]+\\n)*?  - (多见于[^\\n]+)",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route1.name": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*(直捷通路)\\*\\*$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route1.distribution": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*直捷通路\\*\\*\\n(?:  - [^\\n]+\\n)*?  - (多见于[^\\n]+)",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route2.name": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*(动静脉短路)\\*\\*$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp25.route2.distribution": {
      "kp_ordinal": 25,
      "pattern": "^- \\*\\*动静脉短路\\*\\*\\n(?:  - [^\\n]+\\n)*?  - (多见于[^\\n]+)",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp26.lymph_volume": {
      "kp_ordinal": 26,
      "pattern": "^- \\*\\*淋巴液\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp29.metabolic_list": {
      "kp_ordinal": 29,
      "pattern": "^→ ([^\\n]+)↑\\n→ 冠脉",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp29.dilating_list": {
      "kp_ordinal": 29,
      "pattern": "^- \\*\\*舒张冠脉\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp29.overall_constricting_list": {
      "kp_ordinal": 29,
      "pattern": "^- \\*\\*总体/主要效应记作收缩冠脉\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp09.filling_part.0": {
      "kp_ordinal": 9,
      "pattern": "^  - (心室[^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp09.filling_part.1": {
      "kp_ordinal": 9,
      "pattern": "^  - (心房[^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp01.cycle_sequence": {
      "kp_ordinal": 1,
      "pattern": "^- \\*\\*左室\\ 7\\ 期\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp02.pressure_gate_children": {
      "kp_ordinal": 2,
      "pattern": "^- \\*\\*瓣膜压差规则[^\\n]*\\n((?:  - [^\\n]+(?:\\n|$)){4})",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp05.main_chain": {
      "kp_ordinal": 5,
      "pattern": "^- \\*\\*主链\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp06.instant_afterload_children": {
      "kp_ordinal": 6,
      "pattern": "^- \\*\\*后负荷突然↑的瞬间\\*\\*\\n((?:  - [^\\n]+(?:\\n|$)){7})",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp07.contractility.0": {
      "kp_ordinal": 7,
      "pattern": "^- \\*\\*心肌收缩能力/收缩性\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp07.contractility.1": {
      "kp_ordinal": 7,
      "pattern": "^- \\*\\*实际心肌收缩力\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp08.fast_hr_chain": {
      "kp_ordinal": 8,
      "pattern": "^- \\*\\*HR >[^*]+\\*\\* → ([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp19.arteriole_chain": {
      "kp_ordinal": 19,
      "pattern": "^7\\. ([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp23.meaning": {
      "kp_ordinal": 23,
      "pattern": "^- \\*\\*反映\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "kp24.gradient": {
      "kp_ordinal": 24,
      "pattern": "^- \\*\\*总模型\\*\\*：([^\\n]+)$",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    },
    "block.mechanism_spine": {
      "kp_ordinal": null,
      "pattern": "<!-- b1:route:start -->\\n([\\s\\S]*?)\\n\\n## ①",
      "flags": "m",
      "capture_group": 1,
      "cardinality": 1
    }
  },
  "exact_items": [
    {
      "kp_ordinal": 3,
      "item": {
        "memory_id": "b01-m01-cycle-time-extrema",
        "kind": "PRECISION_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "心动周期时间最短/最长？",
        "source_pdf_pages": [
          112,
          113
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "from": {
          "ref": "kp03.time"
        },
        "ops": [
          {
            "op": "strip_emphasis"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "ref": "kp03.time"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp003",
        "collection": "memory_items",
        "memory_id": "b01-m01-cycle-time-extrema"
      }
    },
    {
      "kp_ordinal": 3,
      "item": {
        "memory_id": "b01-m02-cycle-pressure-extrema",
        "kind": "PRECISION_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "主动脉压与左室压的 min/max 分别落在哪个时相？",
        "mnemonic": "快射-双双高潮",
        "source_pdf_pages": [
          112,
          113,
          122
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "主动脉压 "
          },
          {
            "from": {
              "from": {
                "ref": "kp03.aortic_pressure"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "regex_replace",
                "pattern": "，即[^；。]+",
                "replacement": "",
                "flags": "g"
              },
              {
                "op": "regex_replace",
                "pattern": "；",
                "replacement": "，",
                "flags": "g"
              },
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；左室压 "
          },
          {
            "from": {
              "from": {
                "ref": "kp03.left_ventricular_pressure"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "regex_replace",
                "pattern": "；",
                "replacement": "，",
                "flags": "g"
              }
            ]
          }
        ]
      },
      "anchor_field": "anchors",
      "anchor_views": [
        {
          "from": {
            "ref": "kp03.aortic_pressure"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp03.left_ventricular_pressure"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp003",
        "collection": "memory_items",
        "memory_id": "b01-m02-cycle-pressure-extrema"
      }
    },
    {
      "kp_ordinal": 3,
      "item": {
        "memory_id": "b01-m03-cycle-flow-volume-extrema",
        "kind": "PRECISION_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "室压升降最快、射血/充盈最多、心室容积 max/min？",
        "source_pdf_pages": [
          112,
          113
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "from": {
              "from": {
                "ref": "kp03.pressure_speed"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "regex_replace",
                "pattern": "上升最快",
                "replacement": "升最快",
                "flags": "g"
              },
              {
                "op": "regex_replace",
                "pattern": "下降最快",
                "replacement": "降最快",
                "flags": "g"
              },
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；"
          },
          {
            "from": {
              "from": {
                "ref": "kp03.flow_extrema"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；容积 "
          },
          {
            "from": {
              "ref": "kp03.volume_extrema"
            },
            "ops": [
              {
                "op": "regex_replace",
                "pattern": "(?m)^  - ",
                "replacement": "",
                "flags": "g"
              },
              {
                "op": "regex_replace",
                "pattern": " / ",
                "replacement": "/",
                "flags": "g"
              },
              {
                "op": "regex_replace",
                "pattern": "\\n",
                "replacement": "",
                "flags": "g"
              },
              {
                "op": "regex_replace",
                "pattern": "；min",
                "replacement": "，min",
                "flags": "g"
              }
            ]
          }
        ]
      },
      "anchor_field": null,
      "anchor_views": []
    },
    {
      "kp_ordinal": 4,
      "item": {
        "memory_id": "b01-m04-sv-normal",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常每搏输出量 SV？",
        "source_pdf_pages": [
          114
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp04.normal_value"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "ref": "kp04.normal_value"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp004",
        "collection": "memory_items",
        "memory_id": "b01-m04-sv-normal"
      }
    },
    {
      "kp_ordinal": 8,
      "item": {
        "memory_id": "b01-m05-co-normal",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常心输出量 CO？",
        "source_pdf_pages": [
          116
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp08.normal_value"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "ref": "kp08.normal_value"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp008",
        "collection": "memory_items",
        "memory_id": "b01-m05-co-normal"
      }
    },
    {
      "kp_ordinal": 8,
      "item": {
        "memory_id": "b01-m06-hr-overfast-anchor",
        "kind": "PRECISION_THRESHOLD",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "Study 中心率快到约多少时，CO 可因充盈受损而反降？",
        "answer_scope": "Study teaching anchor; mechanism is the Gate, threshold itself is deferred precision.",
        "source_pdf_pages": [
          117
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "ref": "kp08.threshold"
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "concat": [
            {
              "literal": "HR "
            },
            {
              "ref": "kp08.threshold"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp008",
        "collection": "memory_items",
        "memory_id": "b01-m06-hr-overfast-anchor"
      }
    },
    {
      "kp_ordinal": 9,
      "item": {
        "memory_id": "b01-m07-filling-75-25",
        "kind": "PRECISION_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "Study 中正常心室充盈两部分大致比例？",
        "source_pdf_pages": [
          117,
          122
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "from": {
          "ref": "kp09.filling_parts"
        },
        "ops": [
          {
            "op": "strip_emphasis"
          },
          {
            "op": "regex_replace",
            "pattern": "(?m)^  - ",
            "replacement": "",
            "flags": "g"
          },
          {
            "op": "regex_replace",
            "pattern": "\\n",
            "replacement": "",
            "flags": "g"
          }
        ]
      },
      "anchor_field": "anchors",
      "anchor_views": [
        {
          "from": {
            "ref": "kp09.filling_part.0"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            },
            {
              "op": "remove_suffix",
              "value": "；"
            }
          ]
        },
        {
          "from": {
            "ref": "kp09.filling_part.1"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            },
            {
              "op": "remove_suffix",
              "value": "。"
            }
          ]
        }
      ]
    },
    {
      "kp_ordinal": 11,
      "item": {
        "memory_id": "b01-m08-rv-work",
        "kind": "PRECISION_RATIO",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常右室做功约为左室多少？",
        "source_pdf_pages": [
          118
        ],
        "priority": "LOW"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp11.work_ratio"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "ref": "kp11.relative_work"
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp011",
        "collection": "memory_items",
        "memory_id": "b01-m08-rv-work"
      }
    },
    {
      "kp_ordinal": 12,
      "item": {
        "memory_id": "b01-m09-ef-normal",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常 EF？",
        "source_pdf_pages": [
          116,
          118
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp12.normal_value"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "ref": "kp12.normal_value"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp012",
        "collection": "memory_items",
        "memory_id": "b01-m09-ef-normal"
      }
    },
    {
      "kp_ordinal": 17,
      "item": {
        "memory_id": "b01-m10-vein-capacitance",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "静脉容量血管约容纳全身多少血量？",
        "source_pdf_pages": [
          123
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp17.capacity"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "ref": "kp17.capacity"
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp017",
        "collection": "memory_items",
        "memory_id": "b01-m10-vein-capacitance"
      }
    },
    {
      "kp_ordinal": 17,
      "item": {
        "memory_id": "b01-m11-pathology-arteriole-map",
        "kind": "LOW_COUPLING_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "病理学‘细动脉’在本节生理血管分工中对应什么？",
        "source_pdf_pages": [
          123
        ],
        "priority": "LOW"
      },
      "answer_view": {
        "from": {
          "from": {
            "ref": "kp17.pathology_map"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        },
        "ops": [
          {
            "op": "remove_prefix",
            "value": "对应"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "concat": [
            {
              "literal": "病理学“细动脉”："
            },
            {
              "from": {
                "ref": "kp17.pathology_map"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "kp_ordinal": 20,
      "item": {
        "memory_id": "b01-m12-pulse-pressure",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常脉压 PP？",
        "source_pdf_pages": [
          125
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "约 "
          },
          {
            "from": {
              "ref": "kp20.normal_value"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "ref": "kp20.normal_value"
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp020",
        "collection": "memory_items",
        "memory_id": "b01-m12-pulse-pressure"
      }
    },
    {
      "kp_ordinal": 21,
      "item": {
        "memory_id": "b01-m13-bp-peaks",
        "kind": "PRECISION_TIME",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "Study 中动脉压昼夜节律两个高峰？由谁调节？",
        "source_pdf_pages": [
          125
        ],
        "priority": "LOW"
      },
      "answer_view": {
        "concat": [
          {
            "from": {
              "from": {
                "ref": "kp21.peaks"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；"
          },
          {
            "from": {
              "from": {
                "ref": "kp21.rhythm"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "before",
                "value": "调节"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "concat": [
            {
              "literal": "两个高峰："
            },
            {
              "from": {
                "ref": "kp21.peaks"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "kp_ordinal": 23,
      "item": {
        "memory_id": "b01-m14-cvp-normal-physiology",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "按本节生理 Study，CVP 正常值？",
        "answer_scope": "Physiology Study only. Do not unify across subjects until source conflict is adjudicated.",
        "source_pdf_pages": [
          126
        ],
        "priority": "NORMAL",
        "source_conflict": {
          "status": "FAIL_CLOSED",
          "conflict": "Internal-medicine source annotation/original page states 4–12 mmHg.",
          "policy": "Keep physiology-scoped item; no cross-subject unified Memory item."
        }
      },
      "answer_view": {
        "from": {
          "ref": "kp23.normal_value"
        },
        "ops": [
          {
            "op": "strip_emphasis"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "from": {
              "ref": "kp23.normal_value"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          "ops": [
            {
              "op": "remove_suffix",
              "value": "。"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp023",
        "collection": "memory_items",
        "memory_id": "b01-m14-cvp-normal-physiology"
      }
    },
    {
      "kp_ordinal": 25,
      "item": {
        "memory_id": "b01-m15-microcirculation-distribution",
        "kind": "LOW_COUPLING_PAIRING",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "三条微循环通路的典型分布？",
        "source_pdf_pages": [
          130
        ],
        "priority": "NORMAL"
      },
      "answer_view": {
        "concat": [
          {
            "ref": "kp25.route0.name"
          },
          {
            "literal": "："
          },
          {
            "from": {
              "ref": "kp25.route0.distribution"
            },
            "ops": [
              {
                "op": "remove_prefix",
                "value": "多见于"
              },
              {
                "op": "before",
                "value": "；"
              },
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；"
          },
          {
            "ref": "kp25.route1.name"
          },
          {
            "literal": "："
          },
          {
            "from": {
              "ref": "kp25.route1.distribution"
            },
            "ops": [
              {
                "op": "remove_prefix",
                "value": "多见于"
              },
              {
                "op": "before",
                "value": "；"
              },
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；"
          },
          {
            "ref": "kp25.route2.name"
          },
          {
            "literal": "："
          },
          {
            "from": {
              "ref": "kp25.route2.distribution"
            },
            "ops": [
              {
                "op": "remove_prefix",
                "value": "多见于"
              },
              {
                "op": "before",
                "value": "；"
              },
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "。"
          }
        ]
      },
      "anchor_field": "anchors",
      "anchor_views": [
        {
          "ref": "kp25.route0.distribution"
        },
        {
          "ref": "kp25.route1.distribution"
        },
        {
          "ref": "kp25.route2.distribution"
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp025",
        "collection": "memory_items",
        "memory_id": "b01-m15-microcirculation-distribution"
      }
    },
    {
      "kp_ordinal": 26,
      "item": {
        "memory_id": "b01-m16-lymph-volume",
        "kind": "PRECISION_VALUE",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "正常淋巴生成量约多少？",
        "source_pdf_pages": [
          131
        ],
        "priority": "LOW"
      },
      "answer_view": {
        "from": {
          "ref": "kp26.lymph_volume"
        },
        "ops": [
          {
            "op": "strip_emphasis"
          }
        ]
      },
      "anchor_field": "anchor",
      "anchor_views": [
        {
          "from": {
            "from": {
              "ref": "kp26.lymph_volume"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          "ops": [
            {
              "op": "remove_prefix",
              "value": "约 "
            },
            {
              "op": "remove_suffix",
              "value": "。"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp026",
        "collection": "memory_items",
        "memory_id": "b01-m16-lymph-volume"
      }
    },
    {
      "kp_ordinal": 29,
      "item": {
        "memory_id": "b01-m17-coronary-mediators",
        "kind": "LOW_COUPLING_LIST",
        "memory_timing": "D",
        "display": "DOTTED_UNDERLINE",
        "cue": "Study 中冠脉局部代谢/舒张因子与总体收缩因子？",
        "source_pdf_pages": [
          133,
          137
        ],
        "priority": "LOW"
      },
      "answer_view": {
        "concat": [
          {
            "literal": "局部代谢："
          },
          {
            "ref": "kp29.metabolic_list"
          },
          {
            "literal": "；舒张冠脉："
          },
          {
            "from": {
              "from": {
                "ref": "kp29.dilating_list"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "remove_suffix",
                "value": "。"
              }
            ]
          },
          {
            "literal": "；总体/主要效应记作收缩："
          },
          {
            "from": {
              "from": {
                "ref": "kp29.overall_constricting_list"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            },
            "ops": [
              {
                "op": "regex_replace",
                "pattern": "迷走神经",
                "replacement": "迷走",
                "flags": "g"
              }
            ]
          }
        ]
      },
      "anchor_field": "anchors",
      "anchor_views": [
        {
          "ref": "kp29.metabolic_list"
        },
        {
          "from": {
            "from": {
              "ref": "kp29.dilating_list"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          "ops": [
            {
              "op": "remove_suffix",
              "value": "。"
            }
          ]
        },
        {
          "from": {
            "from": {
              "ref": "kp29.overall_constricting_list"
            },
            "ops": [
              {
                "op": "strip_emphasis"
              }
            ]
          },
          "ops": [
            {
              "op": "remove_suffix",
              "value": "。"
            }
          ]
        }
      ],
      "legacy_reference": {
        "kp_field_key": "circulation-b01-kp029",
        "collection": "memory_items",
        "memory_id": "b01-m17-coronary-mediators"
      }
    }
  ],
  "gate_views": [
    {
      "gate_id": "b01-g01-cycle-sequence",
      "kp_ordinal": 1,
      "anchors": [
        {
          "from": {
            "ref": "kp01.cycle_sequence"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g02-valve-pressure-gates",
      "kp_ordinal": 2,
      "anchors": [
        {
          "from": {
            "ref": "kp02.pressure_gate_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 0
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp02.pressure_gate_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 1
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp02.pressure_gate_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 2
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp02.pressure_gate_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 3
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g03-preload-starling",
      "kp_ordinal": 5,
      "anchors": [
        {
          "from": {
            "ref": "kp05.main_chain"
          },
          "ops": [
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g04-afterload-response",
      "kp_ordinal": 6,
      "anchors": [
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 1
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 2
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 3
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 4
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 5
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        },
        {
          "from": {
            "ref": "kp06.instant_afterload_children"
          },
          "ops": [
            {
              "op": "line",
              "index": 6
            },
            {
              "op": "remove_prefix",
              "value": "  - "
            },
            {
              "op": "strip_emphasis"
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g05-contractility-boundary",
      "kp_ordinal": 7,
      "anchors": [
        {
          "concat": [
            {
              "literal": "心肌收缩能力/收缩性："
            },
            {
              "from": {
                "ref": "kp07.contractility.0"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        },
        {
          "concat": [
            {
              "literal": "实际心肌收缩力："
            },
            {
              "from": {
                "ref": "kp07.contractility.1"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g06-fast-hr-filling",
      "kp_ordinal": 8,
      "anchors": [
        {
          "ref": "kp08.fast_hr_chain"
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g08-arteriole-chain",
      "kp_ordinal": 19,
      "anchors": [
        {
          "ref": "kp19.arteriole_chain"
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g10-cvp-meaning",
      "kp_ordinal": 23,
      "anchors": [
        {
          "concat": [
            {
              "literal": "反映："
            },
            {
              "from": {
                "ref": "kp23.meaning"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    },
    {
      "gate_id": "b01-g11-venous-gradient",
      "kp_ordinal": 24,
      "anchors": [
        {
          "concat": [
            {
              "literal": "总模型："
            },
            {
              "from": {
                "ref": "kp24.gradient"
              },
              "ops": [
                {
                  "op": "strip_emphasis"
                }
              ]
            }
          ]
        }
      ],
      "attention_joiner": "；",
      "release_state": "ACTIVE"
    }
  ],
  "inactive_gate_refs": [
    "b01-g07-pv-four-changes",
    "b01-g09-bp-five-factor-matrix",
    "b01-g12-microcirculation-three-routes",
    "b01-g13-edema-four-entry",
    "b01-g14-left-coronary-diastolic"
  ],
  "orientation_view": {
    "from": {
      "ref": "block.mechanism_spine"
    },
    "ops": [
      {
        "op": "strip_emphasis"
      }
    ]
  },
  "model": {
    "status": "CURRENT",
    "derivation": "REVIEWED_DERIVATION",
    "adopted_source_blob": "53a13365b9e0dcc24e9274043bf54a868af0d5ad",
    "node_kp_ids": [
      "circulation-b01-kp09",
      "circulation-b01-kp01",
      "circulation-b01-kp02",
      "circulation-b01-kp04",
      "circulation-b01-kp05",
      "circulation-b01-kp06",
      "circulation-b01-kp07",
      "circulation-b01-kp08",
      "circulation-b01-kp14",
      "circulation-b01-kp22",
      "circulation-b01-kp18",
      "circulation-b01-kp19",
      "circulation-b01-kp25",
      "circulation-b01-kp26",
      "circulation-b01-kp24",
      "circulation-b01-kp23",
      "circulation-b01-kp27",
      "circulation-b01-kp28",
      "circulation-b01-kp29"
    ],
    "core_dependencies": {
      "circulation-b01-kp01": "c5e942a404e01ffd79facb08fb47c2cdadab9b101b72c58ffdb3c6998099dbc0",
      "circulation-b01-kp02": "5d9bbc1bb2d6a43e2dc6ec9ead32e40b1bec89ec3522606bbd3463cbeb057b6e",
      "circulation-b01-kp03": "a74058ed7ad54d8c35914dc64a5d36b3dcb701ed4a5b1404373ca8ecd11a2d79",
      "circulation-b01-kp04": "e1df5252d42b59a1a2e65eab935b656f25fa27c20f98930f89b910a2973c055a",
      "circulation-b01-kp05": "b5d15a9d9024f47b0d10b94f35650dab15e92a737d01593dc7bf1c7ea33c89aa",
      "circulation-b01-kp06": "5a24242332096ef9dba8585ef9e3bd834b67adb4520879dc8a654f175353ad7e",
      "circulation-b01-kp07": "510742504aff6eff727992f4bfe033ae71e3277bf714e480497ea5f6ae691e96",
      "circulation-b01-kp08": "f847a5347e0c4ee4c17950a7ac6788fdcab333a314de8d38d884958b9acee105",
      "circulation-b01-kp09": "421cb7b9bb3ead7b8fdc7a2d5064475fd43fb5e52e9672661be3f822447b31c3",
      "circulation-b01-kp10": "ef3e58e8453e9607851cdafee7c7bea26b05ef332916e02ff7ac57331c4cb2d7",
      "circulation-b01-kp11": "cfed3b40ca8b4dbdf97caed05cd8e605f1f1c16b45e9714e740410d987be8008",
      "circulation-b01-kp12": "078fd4b56cad41a00b22785bf036bd68204d8e1b1e4cf93c900a72e8b996a53e",
      "circulation-b01-kp13": "652eeeb5d25a61ab295d92730cdf78f8a22ace6878e18b021aedeacc13d3fe45",
      "circulation-b01-kp14": "bae85cf8288cefff08b846ca2225d5e5eafb0a107f646959cd0ac772d423d503",
      "circulation-b01-kp15": "d57ca1c518256b18265d391a298c23e82e1bb80ad8a69c7e3858cc79661ab208",
      "circulation-b01-kp16": "191a820d7a507d590d49bdf69dd7d5bd91738849140d099962f1c6721eace180",
      "circulation-b01-kp17": "f4d555c57cb110f50703f60edb75111406a310f275bb324193e0ac1fe7beb274",
      "circulation-b01-kp18": "02b2c6ef56f9f3cd8b3f6559cc48f6b585bf4feca027231c5a3c9ba57886fe0c",
      "circulation-b01-kp19": "6af0d9979e1cb719188c5c83dbd0ecaa3f2b269196ac3437dff8480da6f1a3c6",
      "circulation-b01-kp20": "ff50f922c3d0a87fed00797f4185b5b084547448b5445ccd9292dddade14fed4",
      "circulation-b01-kp21": "cb2942ed09790d3abc45487aeda8bb6980447cea0493316064569143d4365f14",
      "circulation-b01-kp22": "a9730864c864c5f1dfab4c801936c021152ffd5cb58105f4d32b03f08528fc6c",
      "circulation-b01-kp23": "922f3c405614f1d32a2c3204c65765bbc034a78bc289d48f174b4db72903b0d7",
      "circulation-b01-kp24": "5bd43be9ff06efe4cb031279c50d804db60f9ec1766f4383500f1907c589da4a",
      "circulation-b01-kp25": "8193e11e8309da4b751857b9d813214c0ab31dfbe22686a1865116cc0a5ab8ac",
      "circulation-b01-kp26": "02e45bf3c6d3fe0751528d351c9af2e4ebbdbcb03e1b1a6c95ceab89bdb8e288",
      "circulation-b01-kp27": "b3e3dfdfa0daa65ba73253a7a9014247535b843628cc8a2047817d8f0cd788b5",
      "circulation-b01-kp28": "89baeded72b402ad0a73365dfe30c348717ecd54e87d6082ac2e2ff2ea2c1d90",
      "circulation-b01-kp29": "b004dda2aa3195691a66f6e8ca5aa2e74d3449b8e364bdb93b3b55fabe9bea45",
      "circulation-b01-kp30": "62c1e765b23f65d645eb0b9746088d04e6d64b637d6236cc8871034882ea61ef",
      "circulation-b01-kp31": "91ad0aedb570977dadc31d6a2e5ef57a19e3da0cd04dfe75e9d1868ba194e3f2",
      "circulation-b01-kp32": "80645afa9eab09bd1c2c9d3da2efbe25699e604b60c28aef1b5fa1d5133362e9"
    },
    "section": "adopted-model"
  },
  "center_question": "正常循环中，心脏怎样把压力差和容积变化转成每搏与每分钟泵血，血管又怎样把这些输出转成动脉压、静脉回流、组织交换和冠脉供血？"
}
-->

<!-- kianos:model adopted-model -->
# B1｜一圈血怎样被推出、分配、回收，再供养心脏

从充盈开始，沿同一机械变量路线走到回心；左右室分别应用泵模型，稳态输出接近。冠脉是主动脉发出的并行供养支路。节点上的〔完整 Prompt〕就是展开与回忆的入口。先顺着关系重建，卡住才展开原解释；标题可直达完整知识。当前仍是候选阅读稿，不表示已经学习或完成。

<!-- b1:route:start -->
<!-- kianos:model-view mechanism-spine -->
**主路：①充盈／周期 → ②SV／CO → ③动脉储器／阻力 → ④微循环交换 → ⑤静脉回收与再次充盈。**

**并行供养：③主动脉分出冠脉 → ⑥供养心肌 → 维持下一搏。**
<!-- /kianos:model-view -->

## ① 回心进入心室：先装入，再按压差开门

- {{kp:circulation-b01-kp09}}：主动舒张／弹性回缩＋顺应性＋房室压差支持充盈 → EDV；主动舒张≠被动顺应性，房颤丢房缩，快室率再丢舒张时间。 <!-- b1:node {"kp_id":"circulation-b01-kp09","canonical_line":243} -->
- {{kp:circulation-b01-kp01}}：等容收缩 → 快速射血 → 减慢射血 → 等容舒张 → 快速充盈 → 减慢充盈 → 心房收缩，接回下一搏。 <!-- b1:node {"kp_id":"circulation-b01-kp01","canonical_line":86} -->
- {{kp:circulation-b01-kp02}}：压差定开闭，两瓣均闭时容积不变；S1／S2定位关闭，S3／S4定位充盈。减慢射血后段可有惯性前流，不能把瞬时压差写成绝对流向。 <!-- b1:node {"kp_id":"circulation-b01-kp02","canonical_line":101} -->

旁查：[周期极值与精确时点](#circulation-b01-kp03)<!-- b1:external {"kp_id":"circulation-b01-kp03","canonical_line":127} -->。

<details>
<summary>展开这一搏：压差、充盈、储备与评价的原解释</summary>

<!-- b1:source 50:145 -->

## 压差开门，容积才改变

先把一搏跑顺，暂不讨论所有调节激素。这里最稳定的推理顺序是：心肌状态改变压力，压力关系决定瓣膜状态，瓣膜与血流共同决定容积变化。

```text
舒张末充盈完成，EDV达到本搏最大
             ↓
心室开始收缩 → 室压超过房压 → 房室瓣关闭
             ↓
两瓣均闭 → 等容收缩：压上升，容积不变
             ↓
室压达到打开半月瓣的条件 → 射血开始
             ↓
快速射血 → 减慢射血 → 容积减少到ESV
             ↓
半月瓣关闭 → 两瓣均闭 → 等容舒张
             ↓
室压降到低于房压 → 房室瓣开放
             ↓
快速充盈 → 减慢充盈 → 心房收缩补充
             ↓
下一搏EDV
```

### 1｜等容不是不工作，而是门还没开

等容收缩时，肌肉已在产生张力和压力，只是出口尚未打开，血液还没有被明显排出。等容舒张时，肌肉已经放松、压力快速下降，但入口尚未打开，因此容积暂时也不变。

所以“压力在变”和“容积在变”可以分开。它们在PV环中分别表现为近竖直的两段，而不是一张时间图里所有曲线同步上下。

### 2｜瓣膜事件给整段过程定边界

房室瓣关闭与S1对应，半月瓣关闭与S2对应；这两个声音帮助定位收缩与舒张交界。S3放在快速充盈，S4放在心房收缩末端，不能把四个心音全记成四扇瓣膜各自关一次。

正常房室机械时序中，心房先于心室收缩，房室可以同时处在舒张阶段；不能把这个正常模式扩大成任何异常节律下都不可能出现房室收缩重叠。

### 3｜压差规则有一个必须当场理解的动态边界

瓣膜的开闭可用局部压差理解，但已经运动的血液具有动能。减慢射血后段，即使心室压略低于主动脉压，仍可短暂继续向前流。因此“射血时每一瞬间室压都一定高于动脉压”是过度简化。

先有加速，才有随后惯性延续；这不是血液长期自发逆压力梯度运行。原图中三个压力的位置和血流方向要同时看，不能只背一个不等号。

### 4｜极值从过程长出来

两瓣闭时容积不变，因此EDV不仅是一个瞬间，也延续到等容收缩段；ESV同样延续到等容舒张段。压力最快上升、下降分别在两个等容阶段；血量最多的流入、流出阶段则分别是快速充盈、快速射血。

精确时点与正常静息时长取同一 canonical B1 KP01「心动周期总览」和 KP03「心动周期极值 / 最值」的完整正文。先有这条机械路线，再记极值，数字就有地址。

## 装得进去、还能加量、比例看起来正常，是三件事

输出建立在充盈与排空条件上；现在先看心室怎样获得可用的起始容量与储备。静息时数字尚可，不等于心室装血轻松，也不等于运动时还有足够储备。

CI用体表面积标准化CO，适合不同体型的比较。它与“射出比例”EF不同，也与“克服多大压力所做的功”不同。

```text
主动舒张＋弹性回缩＋被动顺应性＋房室压差
                       ↓
                  舒张期充盈
                       ↓
          EDV / SV / CO＋进一步增加的储备
                       ↓
          EF、CI、压力、超声分别观察不同侧面
```

### 1｜放松得快，与容易被撑开，不是同一个性质

胞质Ca²⁺回降、横桥解离等参与主动舒张，弹性回缩也可支持早期抽吸。顺应性则描述压力变化与容积变化的关系，偏被动充盈性质。

两者都能影响充盈，却不能互相替代。一个心室可以松弛变慢，也可以变硬，也可以同时存在两种问题。后面看到E/A变化和舒张压力升高，要先定位到哪一层。

### 2｜房缩有贡献，但不是固定给每个人补四分之一

课程用正常静息约75%与25%帮助分开早期舒张充盈和房缩贡献。它不是所有年龄、心率和顺应性背景的恒定比例。

房颤丢掉有效房缩；若再伴快速室率，又丢失舒张时间。二者可以叠加，使某些患者充盈与输出下降更明显。先理解机械后果，再把节律诊断和治疗交B10，不能在B1用一条比例决定临床处理。

### 3｜储备是“还能增加多少”

心输出量可通过心率储备和SV储备增加；SV储备又来自进一步增加充盈与进一步增强排空。若静息时已经大量动用代偿，运动时可调用的余量就会减少。

“腔已经很大”不等于“舒张储备很强”，它可能意味着相关余量已经耗用。也不能把所有类型心衰都套成同一幅扩张、低EF的图；这里先理解储备概念。

### 4｜EF把输出放回起始容量，但不是整个心功能的通行证

若EDV由120增到160 mL，SV仍为70 mL，EF由约58%降到约44%。这是演算示例：每搏量接近时，射出比例仍可不同。它说明单看SV会遗漏代偿性扩容。

相反，EF保留并不能排除舒张问题或心衰。EF不是直接独立于负荷的收缩性测量，也不能替代症状、充盈压和结构证据。

压力可借助导管测量，容积与功能通常借助超声评估。E/A＜1是早期松弛受损的典型基础模式，年龄、假性正常和限制性充盈可改变形态；不能只凭一个比值把所有舒张异常排除。

左右心室在稳态下每分钟输出接近，但克服的压力不同，因此做功不同。“送相同体积”不等于“付出相同机械功”。

---

## 从一搏能射多少，到一分钟能送多少
<!-- /b1:source -->

</details>

## ② 充盈与排空形成输出：EDV − ESV，再乘 HR

- {{kp:circulation-b01-kp04}}：EDV − ESV＝SV；三种影响要分开： <!-- b1:node {"kp_id":"circulation-b01-kp04","canonical_line":150} -->
  - {{kp:circulation-b01-kp05}}：一定范围内初长度增加 → 本搏输出增加；EDP近似EDV时保留顺应性条件。 <!-- b1:node {"kp_id":"circulation-b01-kp05","canonical_line":166} -->
  - {{kp:circulation-b01-kp06}}：骤增先使当搏SV↓、ESV↑；后续回心未明显减少时，次搏EDV可↑并发生代偿。 <!-- b1:node {"kp_id":"circulation-b01-kp06","canonical_line":185} -->
  - {{kp:circulation-b01-kp07}}：相近负荷下收缩性增强可使ESV↓；实际力同时受前负荷、后负荷、收缩性影响。 <!-- b1:node {"kp_id":"circulation-b01-kp07","canonical_line":210} -->
- {{kp:circulation-b01-kp08}}：CO＝HR×SV；过快HR缩短充盈，SV可降到使CO反降。CI按体表面积比较，不是做功。 <!-- b1:node {"kp_id":"circulation-b01-kp08","canonical_line":228} -->
- {{kp:circulation-b01-kp14}}：同一搏投到P–V轴：右EDV、左ESV、宽SV；前负荷改充盈端，后负荷与收缩性改排空，顺应性改舒张关系，均按单变量条件核验。 <!-- b1:node {"kp_id":"circulation-b01-kp14","canonical_line":329} -->

输出的旁查量与检验，不是血流的新站：[储备](#circulation-b01-kp10)<!-- b1:external {"kp_id":"circulation-b01-kp10","canonical_line":263} -->、[EF](#circulation-b01-kp12)<!-- b1:external {"kp_id":"circulation-b01-kp12","canonical_line":297} -->、[做功](#circulation-b01-kp11)<!-- b1:external {"kp_id":"circulation-b01-kp11","canonical_line":282} -->、[压力／容积／超声](#circulation-b01-kp13)<!-- b1:external {"kp_id":"circulation-b01-kp13","canonical_line":313} -->；[三类曲线与顺应性](#circulation-b01-kp15)<!-- b1:external {"kp_id":"circulation-b01-kp15","canonical_line":348} -->、[四瓣膜时相／杂音](#circulation-b01-kp16)<!-- b1:external {"kp_id":"circulation-b01-kp16","canonical_line":366} -->。EF保留不排除舒张问题；曲线不能互换，疾病完整内容回原Block。

<details>
<summary>展开输出与图形：三因素、HR反转、PV变化与瓣膜验证</summary>

<!-- b1:source 146:221 -->

周期与充盈条件给出了EDV和ESV。现在先看它们之差，再看什么能改变这个差。不要先背三种负荷的定义，却不知道它们改变了容积环哪一端。

```text
充盈 / 回心 → EDV ─┐
                   ├→ SV＝EDV－ESV → 乘HR → CO
排空 / 出口 → ESV ─┘

前负荷：收缩前的初长度 / 充盈条件
后负荷：收缩时需克服的负担
收缩性：在负荷相近时，心肌自身能产生怎样的收缩
```

### 1｜装得更多，与挤得更干净，是两条增加SV的路

一定范围内，回心增加使收缩前初长度增加，心肌通过Frank–Starling机制提高本搏输出。这叫异长调节：主要改变了起始长度。

增强收缩性则是另一条路：在相近起始条件下，心肌排空能力更强，ESV可减少，SV增加。它不是必须先把心室装得更大。

因此“实际收缩力变强”不能直接等于“收缩性变强”。实际表现同时受前负荷、后负荷和内在收缩性影响。

### 2｜出口突然更难推时，先看当前一搏，再看后来

后负荷突然升高，心室需要更高压力才打开出口，等容收缩过程改变，缩短和排空受限，当前SV减少、ESV增加。

若后续回心没有明显减少，残余更多加上新流入，次搏EDV可增加，再通过Frank–Starling补偿；还可能出现收缩能力方面的调节。这是“即时结果”和“之后代偿”，不能把后面的恢复直接覆盖最初的下降。

```text
后负荷突然↑ → 当搏射出减少 → ESV↑
                     ↓ 还要看后续回心条件
               次搏EDV可↑ → 异长代偿
```

前负荷用EDV、EDP作近似时必须保留顺应性背景。同样容积在硬的心室里压力更高，因此压力与容积不是天然同义词。

### 3｜心率乘上去之前，搏出量可能已经变了

CO＝HR×SV是恒等关系，不是“心率提高而SV永远固定”的保证。心率增加会缩短周期，尤其缩短可用于舒张充盈的时间；过快时SV下降足以盖过次数增加，CO反而降低。

课程约180次/分用于正常条件下极快心率的方向示例，不是每个人一到某个数字才出现充盈问题。病变心室的条件可能更早受限。

**关系压缩：先分EDV端与ESV端，再把HR的充盈代价放回乘法；增加一个变量不等于总输出必然同向。**

## 用PV环和曲线检查前面的推理

这里不是再加一种抽象记忆，而是把已经理解的周期和负荷投到坐标系。先认轴，再认边界和方向，最后才看整幅形状。

```text
横轴＝心室容积，纵轴＝心室压力
         ↓
右边界EDV，左边界ESV → 横向宽度＝SV
         ↓
右侧等容收缩向上 → 上方射血向左
左侧等容舒张向下 → 下方充盈向右
         ↓
再改变一个条件，检查哪一端或哪条关系先变
```

### 四种改变保留四个不同原因

- 前负荷增加：在其他条件近似不变时，EDV向右，输出可增加
- 后负荷增加：压力负担升高，ESV可向右，环更高、更窄
- 收缩性增强：收缩末期关系改变，ESV向左，输出可增加
- 顺应性下降：舒张压力—容积关系左上移；相同充盈压下装得更少

前负荷增加和收缩性增强都能使环变宽，但前者主要推动右边界，后者改变收缩末期关系并影响左边界。这就是图比“SV都增加”更有用的地方。

不能把“向左上移”当通用咒语：心室功能曲线、ESPVR、舒张P—V曲线不是同一张图。顺应性下降是同容积压力更高 / 同压力容积更小，描述的是充盈关系，不是把整只PV环任意搬走。

四瓣膜短接口也用同一时间轴定位：狭窄在本应开放的通行时段产生阻碍，关闭不全在本应关闭的时段出现反流。由此定位MS、MR、AS、AR的时期，再用对应原图记声音形态。MS的典型舒张末增强与有效房缩相关，不能把所有MS杂音全程画成单纯递增。

完整瓣膜病因、重构与手术门槛回B7。



# 动脉分配：把间断输出变成持续供血
<!-- /b1:source -->

</details>

## ③ 血进入动脉：储能／回弹维持流动，阻力分配流量

- {{kp:circulation-b01-kp22}}：收缩期大动脉扩张储能，舒张期回弹继续推动血流；CO与TPR共同影响MAP。MAP≈CO×TPR须右房压可忽略；五因素方向先固定其余条件。 <!-- b1:node {"kp_id":"circulation-b01-kp22","canonical_line":461} -->
- {{kp:circulation-b01-kp18}}：局部Q≈ΔP/R；理想层流下R∝ηL/r⁴，口径是强旋钮，不能当真实全身的精确圆管算法。 <!-- b1:node {"kp_id":"circulation-b01-kp18","canonical_line":401} -->
- {{kp:circulation-b01-kp19}}：在相应单因素条件下，收缩使阻力↑、局部流量↓，并联动毛细血管压与交换；全身血压与局部血流不是同一量。 <!-- b1:node {"kp_id":"circulation-b01-kp19","canonical_line":419} -->

读数与背景旁查：[SBP／DBP／PP／MAP定义、公式与参考值](#circulation-b01-kp20)<!-- b1:external {"kp_id":"circulation-b01-kp20","canonical_line":435} -->、[年龄及昼夜变化](#circulation-b01-kp21)<!-- b1:external {"kp_id":"circulation-b01-kp21","canonical_line":448} -->；全网络的[七类血管分工](#circulation-b01-kp17)<!-- b1:external {"kp_id":"circulation-b01-kp17","canonical_line":383} -->横跨储能、分配、交换、回收，不另造七站。

<details>
<summary>展开动脉分配：弹性储器、黏度与五因素方向</summary>

<!-- b1:source 222:257 -->

## 泵间断射血，动脉为何能持续供血

血离开心室后，不是直接把每搏输出均匀送到所有器官。大动脉先储能，小动脉再调阻力和分配，最后形成我们测到的不同压力指标。

```text
收缩期射血 → 大动脉扩张储能
                  ↓
舒张期心室不再射血，但大动脉回弹继续推动血流
                  ↓
小动脉 / 微动脉阻力 → 决定流出速度与分配
                  ↓
形成SBP、DBP、PP与整个周期的平均压力
```

### 1｜弹性储器与阻力配合，才解释舒张压

若只看到心脏射血，就容易以为舒张期动脉血压应当立即归零。大动脉弹性和外周阻力让排出过程延续，舒张期仍有压力和前向流量。

储器作用减弱时，同样射血可使收缩压更高，舒张期支持减少，脉压变宽。它与单纯TPR升高不同，不能都写成“血管不好所以所有血压一起升”。

### 2｜局部阻力最重要的旋钮是口径

理想层流模型中R与ηL/r⁴有关，半径变化影响很大。但人体血液和血管不完全符合刚性圆管条件，所以它是解释方向与敏感性的近似，不是拿一段真实血管直接精确算全身阻力的公式。

HCT、切率、口径范围与温度都影响表观黏度。贫血可降低黏度，但心脏加输出还要考虑氧输送需要；不能把高排量状态仅归结为一个阻力数字。冬季血栓风险也不能只靠温度—黏度这一条链解释所有病例。

### 3｜从一个输入推压强，必须先固定其他条件

增加SV，收缩期输入更多，SBP升幅通常更突出；在生理可代偿范围内加快HR，舒张期外流时间减少，DBP可升得更多；TPR增加同样可使舒张期外流受限。储器作用减弱则让SBP、DBP可能反向变化。

这是一张单因素实验矩阵，不是一份所有疾病的固定答案。极快心率已经减少SV时，不能还假定SV不变继续套表。

年龄与昼夜属于背景条件。老年动脉硬化可出现SBP继续升而DBP下降、PP变宽，不应把“年龄越大，SBP和DBP都无限单调升高”冻结成模型。

---
<!-- /b1:source -->

</details>

## ④ 分配到微循环：流经不等于交换，组织液还要回收

- {{kp:circulation-b01-kp25}}：微动脉分流 → 真毛细血管交换 → 微静脉回收；营养／直捷／动静脉短路功能不同，由三闸门调节，不能用总流量代替有效交换。 <!-- b1:node {"kp_id":"circulation-b01-kp25","canonical_line":555} -->
- {{kp:circulation-b01-kp26}}：交换床连组织液与淋巴回收；静水压↑、血浆胶体渗透压↓、通透性↑或淋巴受阻均可进入水肿。经典四力有适用范围，组织水多不等于有效循环量多。 <!-- b1:node {"kp_id":"circulation-b01-kp26","canonical_line":588} -->

<details>
<summary>展开交换与回收：三通路、暖休克接口、水肿四入口</summary>

<!-- b1:source 299:310 -->
### 3｜有流量不等于交换充分

迂回营养通路经过真毛细血管，适合交换；直捷通路偏快速回流；动静脉短路绕过正常交换床，参与体温等调节。总闸门、分闸门与后闸门决定了不同层面的流量、压力和交换条件。

因此皮肤温暖、总流量尚可，不保证全身微循环交换均匀有效。暖休克只是后续接口，不把一个短路通道当成所有暖休克的唯一成因。

### 4｜水肿是“进入组织的水”与“清除”不平衡

经典滤过模型比较静水压与胶体渗透压；通透性决定屏障怎样工作，淋巴则把一部分水和蛋白回收。因此水肿可以从静水压升高、血浆胶体渗透压降低、通透性增加、淋巴受阻四个入口进入。

同样是肿，可以分别来自上游淤血、蛋白不足、屏障漏或回收不畅。不要只看见“组织水多”就默认血管内有效容量也多。经典公式用于当前课程坐标，不替代所有组织、所有时间状态的完整微血管交换模型。

<!-- /b1:source -->

</details>

## ⑤ 静脉把血送回：送血端与右心接受端一起看

- {{kp:circulation-b01-kp24}}：外周静脉与右房的压差驱动回流 → 右心接受与再充盈；送血看容量／张力／分布／泵，接受看排空／松弛／顺应性／外压。自主吸气不等于正压通气，节律肌泵不等于持续压迫。 <!-- b1:node {"kp_id":"circulation-b01-kp24","canonical_line":521} -->
- {{kp:circulation-b01-kp23}}：回心量与右心泵出共同决定CVP；右心泵出增强可使CVP↓而回流↑。CVP不是血容量计；大静脉塌陷等限制使回流不随右房压降低而无限增加。 <!-- b1:node {"kp_id":"circulation-b01-kp23","canonical_line":506} -->

<details>
<summary>展开回心：CVP合力、送血／接受十三因素与方向边界</summary>

<!-- b1:source 258:298 -->

# 回收与供养：让同一圈血闭合

## 回心得到持续支持，交换才真正闭环

动脉侧输出不能脱离静脉侧输入。回心与交换关系把血管回路合上，同时把“血流经过”与“组织完成交换”分开。

```text
外周静脉侧压力 / 容量条件
                  ↓ 与右房压力形成梯度
             静脉回流 → 心室充盈
                  ↑
       呼吸、肌肉泵、静脉张力、体位等影响

微动脉分流 → 真毛细血管交换 → 微静脉回收
                         ↕
                 组织液 ↔ 淋巴回收
```

### 1｜CVP是两端合成结果，不是一支血容量计

更多血向右心返回，可使CVP升高；右心排出受限，也能使CVP升高。两种情况下“压力高”的原因不同，不能直接推得相同补液决策。

右心泵出增强可降低右房压力，增大外周静脉到右房的驱动差，回心随之增加。这里CVP下降并不意味着静脉回流一定减少。

静脉回流还受回流通路阻力等因素影响；当胸内大静脉塌陷等限制出现，不能把“右房压力越低，回流无限增加”当定律。

### 2｜把13项方向放进送血端与接受端

血容量、静脉张力、体位和肌肉泵等主要改变送血条件；右心泵功能、舒张、心包压力和顺应性等影响接受条件。这样一张名单就被放到压差模型的两边。

送血端先拆成三个旋钮：**血有多少、容量池有多大、血被留在哪个位置**。血容量或输液输入增加，在容纳空间近似不变时提高充盈；静脉收缩则不增加总血量，而是缩小容量池、动员已有的血。两种方式可以同样支持回心，起点却不同。

再看分布和外力。直立转平卧，低位静脉因重力留下的血减少；走路时肌肉一挤一松，配合静脉瓣把血向近心端推；浸入深水，外部静水压力也会压缩低位容量池，让血向中央转移。它们共同改变的是“已有血怎样回去”，不是制造了新血。

接受端则看**能否排空、能否放松、能否被充开**。右心及时泵出，右房积血和压力可下降；Ca²⁺回收加快帮助主动松弛；顺应性增加使相同压力下较容易装入血；心包外压下降减轻外部限制。心率若原来过快，适当减慢还可把充盈时间还回来。这些因素都支持接受回流，但彼此不是同一种“抽吸力”。

微动脉舒张另占一个位置：它改变血通过外周通路的阻力。在驱动压近似维持的短时模型里，血更容易流向静脉端；若同时发生明显全身低压，就要重新比较驱动压和阻力，不能只记“舒张必增回心”。

吸气促进右心回流的常见链条，默认自主呼吸等条件；正压通气的胸内压变化不能直接照搬。节律性肌肉收缩配合静脉瓣促进回流，持续强力压迫则可能阻碍回流。这些条件不是低频装饰，会改变答案方向。

<!-- /b1:source -->

</details>

## ⑥ 同时，主动脉分出冠脉：供养泵，才能继续下一搏

- {{kp:circulation-b01-kp27}}：左室收缩压迫壁内血管，左冠更依赖舒张期；有效灌注压近似主动脉舒张压−左室舒张末压。右冠并非只在收缩期灌注，时相受压力等条件影响。 <!-- b1:node {"kp_id":"circulation-b01-kp27","canonical_line":614} -->
- {{kp:circulation-b01-kp28}}：供氧看灌注压／时间／阻力及携氧；HR过快既缩短舒张供血时间又可增耗氧，供需两端一起判。 <!-- b1:node {"kp_id":"circulation-b01-kp28","canonical_line":629} -->
- {{kp:circulation-b01-kp29}}：心肌工作↑ → 耗氧↑ → 局部代谢舒张可盖过交感直接缩血管；局部受体作用与完整器官净效应分开。 <!-- b1:node {"kp_id":"circulation-b01-kp29","canonical_line":650} -->

用同一供需模型做短验证：[心绞痛七场景](#circulation-b01-kp30)<!-- b1:external {"kp_id":"circulation-b01-kp30","canonical_line":693} -->、[β受体阻断剂](#circulation-b01-kp31)<!-- b1:external {"kp_id":"circulation-b01-kp31","canonical_line":706} -->、[硝酸酯](#circulation-b01-kp32)<!-- b1:external {"kp_id":"circulation-b01-kp32","canonical_line":718} -->。药物改变供需变量，不能由“扩血管”推出固定狭窄下必增总流量；完整诊疗回B6。

<details>
<summary>展开冠脉：时相、净调节、供需与药物短接口</summary>

<!-- b1:source 311:355 -->
## 泵要自己有氧，才能持续为全身工作

现在把冠脉接回循环起点：心脏一边给全身射血，一边也需要自身灌注。心肌已有较高摄氧，需求增加时，增加冠脉流量非常重要。

```text
氧供端：灌注压＋可用灌注时间＋冠脉阻力＋血液携氧
                            ↕
耗氧端：心率＋收缩活动＋室壁张力 / 负荷
                            ↓
                    供需是否匹配
```

### 1｜左室最努力收缩时，自己的小血管反而被压

左室收缩压迫壁内血管，因此左冠供血更依赖舒张期。以主动脉舒张压减左室舒张末压近似观察驱动差，可以同时看到两种供血不利条件：入口压力不足，或心室内压力过高。

心率过快缩短舒张期，同时还可能提高需求；所以一个变化可以从供、需两端制造压力。不能只看心率乘CO的一面。

右室通常受收缩期压迫较小，收缩期也能获得灌注；这不等于右冠只在收缩期有血流。右室压力或肥厚改变时，时相也会改变，不能把左、右冠画成两个绝对互斥时段。

### 2｜交感兴奋时，局部代谢可以盖过直接缩血管

交感增强心肌工作→耗氧增加→局部代谢舒张信号增加，净冠脉血流可上升。若只背冠脉α受体收缩，就会得出相反结论。

同样，迷走降低心肌工作后的总体影响，与直接冠脉受体作用不是同一层。复习时先辨局部受体效应还是完整器官净效应，再用课程介质表补名字。

### 3｜药物只用来验证供需变量

β₁阻断降低心率与收缩活动，可减少耗氧，并增加舒张灌注时间；不要求所有有效药都必须同时阻断β₂。硝酸酯主要通过静脉侧减轻前负荷和壁张力，也有动脉及冠脉相关作用；严重固定狭窄时，不能简单认为扩血管就必然提高总冠脉流量。

这些解释让药物有可理解的位置，不足以独立给出具体病人的用药选择。完整心绞痛、ACS与治疗方案交B6。

### 整块交给B2的变量

```text
HR / 收缩性 → SV / CO
回心 / CVP / EDV → 前负荷
动脉压力 / 阻力 → 后负荷与器官流量
微循环交换 / 淋巴 → 组织液与水肿
冠脉供需 → 泵是否有能力继续工作
```

B2只需接着回答这些变量偏了以后谁感知、谁执行、谁调整容量。B1不是静态名词目录，而是一条可以逐处改变输入、再沿上下游推结果的机械模型。

---
<!-- /b1:source -->

</details>

<!-- b1:route:end -->

## 合上解释，从起点重建到终点

合上解释，按开头的①→⑤主路重建，再接回⑥冠脉供养；每到一处，用节点的完整 Prompt 恢复知识。最后改变一个输入，沿同一路线推结果并说出条件。

[六条反事实链](#circulation-b01-reference-008b07e5898f)用于验证推理；[进入B2前十二问](#circulation-b01-reference-95ee19d753d5)与[B1→B2交接](#circulation-b01-reference-10d6daa47d47)把这些被调变量交给B2的传感器、控制器与效应器。

## 精确记忆与原图：已有位置，不加入血流箭头

- 正常值、极值、配对、名单与比较表按节点标题回完整 Core；推理即时需要的条件当场展开，其他细项再复习。
- 已准入的13项由[现有 Precision 索引](#circulation-b01-reference-169d12f51036)及[已有准备答案／记忆辅助](#circulation-b01-reference-169d12f51036)消费；本页不新增卡片或改变学习状态。
- 4项仍留原语境、未独立准入：[流量／容积极值](#circulation-b01-kp03)、[正常静息充盈比例及条件](#circulation-b01-kp09)、[病理细动脉对应](#circulation-b01-kp17)、[昼夜高峰](#circulation-b01-kp21)。
- CVP Source差异保留：[生理4–12 cmH₂O与内科4–12 mmHg各自原语境](#circulation-b01-kp23)；不合并为跨学科统一值。
- MedicalVisual：[全部十项原图要求](#circulation-b01-reference-ef45bb7d4e25)与[当前选择性图像定位](#circulation-b01-reference-169d12f51036)。当前推理依赖图形时就看原图；列出定位不等于已看。
- 非正文项：[即时机制与延后精度类别](#circulation-b01-reference-ee248caba698)、[原资料、Primary和短接口范围](#circulation-b01-reference-b8da2d09bb5b)、[心肌／心包限制充盈接口](#circulation-b01-reference-169d12f51036)；来源核验保留于下方记录，未决项不补造答案。

<details>
<summary>原开篇与全圈图：查看原有模型背景</summary>

<!-- b1:source 2:49 -->

# B1｜一圈血怎样被推出、分配、回收，再供养心脏
## 给 Chat 的建模教学稿 · 正式正文对齐版

> 组织规则：[Lecture Replacement Contract](../../../knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md)。

沿整块医学模型连续教学；LG 的 membership/order/goal/closure 只负责后台覆盖、检索与收口，不把讲解切成 LG01/LG02 的视觉或话术分段。先建立整章位置与机制，再在需要处放大子模型。第一次先让学习者能沿真实关系走，不先给满屏正常值。原图用于压力—容积、曲线与通路确实比文字更清楚的部分。当前样稿不要求用户回答问题；故障与反例直接演示推导。

# 开 Block｜先给循环系统一副机械骨架

B1要解决的不是“心脏有几个时期、血压有几个指标”，而是一个连续问题：心脏间断收缩，怎样使血液持续走完一圈，并让组织完成交换。

这条路线有泵、有只允许合适方向通过的瓣膜、有储能和分流的血管，还有把血送回来的容量池。泵自己也需要供血，因此冠脉必须回接到同一个模型，而不是最后额外背一章。

```text
静脉把血送回来 → 心室得到充盈
                         ↓
                  心肌产生压力变化
                         ↓
                  压差控制瓣膜开闭
                         ↓
             一搏排出多少 → 每分钟排出多少
                         ↓
          大动脉储能 / 回弹＋小动脉阻力分配
                         ↓
             微循环：把流量转成有效交换
                         ↓
            静脉回收＋淋巴回收 → 再回心

同时：主动脉发出的冠脉 → 供养正在工作的心肌
                                  ↓
                            保持下一搏的能力
```

第一遍只保留四个变量：压力P、流量Q、阻力R、容量V。随后四个公式都在描述这同一圈血：

<!-- kianos:model-view formula-language -->
- SV＝EDV－ESV：装进来多少，收缩后剩多少
- CO＝HR×SV：每次输出乘每分钟次数
- MAP≈CO×TPR：全身压力的第一近似；右房压不能忽略时需保留压力差
- Q≈ΔP/R：局部流量看两端压差和当地阻力
<!-- /kianos:model-view -->

不要把总血量、心室容积、每搏流量和每分钟流量当成同一个“血多了”。单位与位置先分清，后面的题就容易落位。

模型从周期与充盈形成每搏输出，再沿动脉分配、微循环交换、静脉回收与冠脉供养闭合；PV环在周期与负荷改变处直接核验。

---

# 泵的一搏：周期、充盈、输出与图形核验
<!-- /b1:source -->

</details>


<details>
<summary>来源与候选记录：查看既有证据和未决边界</summary>

<!-- b1:source 356:376 -->

## 供Chat查阅的验证与来源附注

- 分组来自当前A1 system.json：7LG、32KP。内容依据B1现行阅读版及生理Source112–119、121–126、128–133；原图检查范围另据验收记录，不以文件存在代替已看。
- 本稿是正式正文的教学展开视图，不证明用户已学会；原题覆盖与Source口径按本页末尾准确范围。
- EF保留不能排除HFpEF：[ACC对AHA/ACC/HFSA指南的官方说明](https://www.acc.org/About-ACC/Press-Releases/2022/04/01/15/22/ACC-AHA-HFSA-Issue-Heart-Failure-Guideline)。只用于当前机械判断边界，不提前给治疗方案。
- 年龄趋势不能写成SBP/DBP终身均单调上升：[Framingham原始随访](https://pubmed.ncbi.nlm.nih.gov/9236450/)。
- 右冠并非只有收缩期灌注，肺高压背景可减少其收缩期流量：[右冠流量原始研究](https://pubmed.ncbi.nlm.nih.gov/18065750/)。
- 原课程对顺应性与主动舒张、MS杂音形态、年龄与右冠时相有简化；相关条件已经进入所绑定正式Core，本稿保留对应教学解释，不再沿用旧“待同步”状态。

- MS完整杂音形态与舒张末增强：[MSD专业版](https://www.msdmanuals.com/professional/cardiovascular-disorders/valvular-disorders/mitral-stenosis)。回流在较低右房压下出现平台的经典实验：[Guyton等](https://journals.physiology.org/doi/abs/10.1152/ajplegacy.1957.189.3.609)。这两项用于限定推理，不外推为床旁治疗规则。

## 本次对齐范围｜2026-10-03

本稿沿用已有教学/复习模型，对照已发布正式正文与A1收尾的59个具体Source边界主题；不再把旧2/5/4/7无题目身份汇总当作当前待办。B1–B4共291条原题路由已有逐行依据，但路由完成不等于本稿自含全部细项答案，也不等于全部原图已重看。当前唯一精确Source符号未定项为B3 physiology-U012-row27（生理印刷P127/物理P142），其余已处理模型条件或有界保留的Source差异仍按原结论保留。

教学和复习共用正式Block知识；此文件不另定医学真相、不生成学习记录、完成或复习债。绑定正文、Learning或来源条件变化时，先读最新正式owner并重新核对受影响内容，不能拿本稿覆盖当前规则。

## 本次候选内容核对｜2026-10-04

本次 Prompt 支持定位：正文的周期电影、负荷/充盈比较、PV 环、压力/回心/交换和冠脉供需是连续主线。未逐项展开的正常值/时点取 canonical KP01–04、KP08、KP10、KP12、KP20、KP23 对应表项；动脉压昼夜两高峰取 KP21；五因素方向矩阵取 KP22；送血/接受端十三项取 KP24；三通路结构/分布/开闭全比较取 KP25。这里是精确支持位置，不宣称正文已经自含这些全量表项。
<!-- /b1:source -->

</details>

<!-- /kianos:model -->

<!-- kianos:historical-opening
"# Block 1｜正常机械循环 · 学习阅读版 v7｜最终执行版\n\n> **中心问题**：正常循环中，心脏怎样把压力差和容积变化转成每搏与每分钟泵血，血管又怎样把这些输出转成动脉压、静脉回流、组织交换和冠脉供血？\n\n# 先建立脑内机械模型\n\n整个 B1 先只留下这一条 Mechanism Spine：\n\n```text\n压力差\n→ 瓣膜开闭\n→ 心室容积变化\n→ SV / CO\n→ 动脉压力与器官血流\n→ 静脉回心与再次充盈\n→ 微循环交换\n→ 冠脉维持泵自身供血\n```\n\n四个公式是这条链的最小变量语言：\n\n```text\nSV = EDV − ESV\nCO = HR × SV\nMAP ≈ CO × TPR\nQ ≈ ΔP / R\n```\n\n不要把它们当四个孤立公式。它们描述的是同一圈血：\n\n```text\n一次心跳\n→ 压力差开关瓣膜\n→ 决定一次射多少\n→ HR把一次射血变成每分钟输出\n→ 血管阻力与弹性把输出变成动脉压和器官流量\n→ 静脉容量池把血送回来\n→ 微循环完成交换\n→ 冠脉给泵自身供血\n→ 再进入下一次心跳\n```\n\n# 总 Framework\n\n```text\n① 泵周期\n   压力差 → 瓣膜 → 心音 → 容积\n   [KP01–KP03]\n        ↓\n② 输出与负荷\n   SV → 前负荷 / 后负荷 / 收缩性\n   → CO / HR / 储备 / EF / PV环\n   [KP04–KP16]\n        ↓\n③ 动脉与压力\n   血管分工 → 阻力 / 微动脉\n   → SBP / DBP / PP / MAP\n   [KP17–KP22]\n        ↓\n④ 静脉回心\n   CVP ↔ 右心射血能力 / 静脉容量池\n   → 再次充盈\n   [KP23–KP24]\n        ↓\n⑤ 微循环交换\n   三通路 → 组织液 / 淋巴 / 水肿\n   [KP25–KP26]\n        ↓\n⑥ 冠脉自供\n   舒张期灌注 → 局部代谢调节\n   → 供氧 / 耗氧接口\n   [KP27–KP29]\n        ↓\n临床验证接口\n   心绞痛与抗心绞痛药只用来验证供需模型\n   完整冠心病归 B6\n   [KP30–KP32]\n```\n\n---\n\n## ① 泵周期：一次心跳怎么完成\n\n> 心动周期 → 压力差 → 瓣膜 → 心音 → 容积\n\n"
-->

### KP01｜心动周期总览

> **讲义定位 →** 生理 Lecture PDF P112
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：定义｜HR↔周期｜收舒时长｜房室时序｜左室7期｜舒张末定位

#### 详细展开

- **定义**：心脏每跳动一次构成一个机械活动周期。
- **周期与心率**：周期越长 → 心率越慢；整个周期中 **舒张期 > 收缩期**。
- **兴奋起点**：窦房结 → 心房先于心室收缩。
- **房室关系**：心房、心室不能同时收缩；可以同时舒张。
- **左室 7 期**：等容收缩 → 快速射血 → 减慢射血 → 等容舒张 → 快速充盈 → 减慢充盈 → 心房收缩。
- **心室舒张末期**：心房收缩期。

### KP02｜压力差 → 瓣膜 → 4 心音

> **讲义定位 →** 生理 Lecture PDF P112–114
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：4压差规则｜等容/减慢射血｜4心音｜4瓣膜事件

#### 详细展开

- **瓣膜压差规则（正常周期的方向模型；动态时还受血流惯性影响）**
  - 房压 > 室压 → 房室瓣开；
  - 室压 > 房压 → 房室瓣关；
  - 室压 > 动脉压 → 半月瓣开；
  - 动脉压 > 室压 → 半月瓣关。
- **等容收缩期**：房室瓣关、半月瓣关；左房压 < 左室压 < 主动脉压。
- **4 心音**
  - **S1**：房室瓣关闭；等容收缩期开始；标志心室开始收缩。
  - **S2**：半月瓣关闭；等容舒张期开始；标志心室开始舒张。
  - **S3**：快速充盈期；快速入血冲击心室壁；部分人可有。
  - **S4**：心房收缩期；听到即异常；房颤因无有效心房收缩而无 S4。
- **4 个瓣膜事件**
  - 房室瓣关 → 等容收缩开始；
  - 半月瓣开 → 快速射血开始；
  - 半月瓣关 → 等容舒张开始；
  - 房室瓣开 → 快速充盈开始。
- **减慢射血后段**：左室压可降至低于主动脉压，而房室瓣仍关、半月瓣尚开；已有前向血流可因惯性短暂继续，随后半月瓣关闭。课程把这一特殊阶段概括为左房压 < 左室压 < 主动脉压，不能外推为整个射血期固定排序，也不能把压差刚反向等同于瞬时停流。

### KP03｜心动周期极值 / 最值

> **讲义定位 →** 生理 Lecture PDF P113
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：时长2极｜主/室压各2极｜室压升降速｜射/充量极值｜容积2极

#### 详细展开

- **时间**：最短＝等容收缩期；最长＝减慢充盈期。
- **主动脉压**：min＝等容收缩期末，即舒张压；max＝快速射血期末，即收缩压。
- **左室压**：min＝快速充盈期间；max＝快速射血期末。
- **室压变化速度**：上升最快＝等容收缩；下降最快＝等容舒张。
- **血量**：射血最多＝快速射血；充盈最多＝快速充盈。
- **心室容积**
  - max＝心房收缩期末 / 等容收缩期初；
  - min＝减慢射血期末 / 等容舒张期初。



---

## ② 输出与负荷：一次能泵多少、一分钟能泵多少

### KP04｜搏出量 SV：一次泵多少

> **讲义定位 →** 生理 Lecture PDF P114
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：定义/正常值｜SV公式｜EDV/ESV｜决定因素3

#### 详细展开

- **SV**：一侧心室一次搏动射出的血量，约 **60–80 mL**。
- **公式**：SV = EDV − ESV。
- **3 个决定因素**：前负荷、后负荷、心肌收缩能力/收缩性。
- 感性入口：
  - **装得更多**：EDV↑；
  - **挤得更干净**：ESV↓；
  - 二者都可使 SV↑。

### KP05｜前负荷 → Frank–Starling

> **讲义定位 →** 生理 Lecture PDF P114
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：别称3｜本质｜前负荷→SV（范围）｜回心入口｜长度—张力比较｜压力≈容积边界

#### 详细展开

- **3 个别称**：初长度 / 容量负荷 / 心室舒张末期容积或压力。
- **本质**：心肌收缩前承受的负荷。
- **主链**：一定范围内前负荷↑ → 初长度↑ → 心肌收缩力↑ → SV↑。
- 这条链叫 **Frank–Starling 机制 = 异长自身调节**。
- **前负荷的重要入口**：静脉回心血量↑。
- **心肌 vs 骨骼肌长度–张力**
  - 都有最适初长度；
  - 心肌：初长度储备大、降支不明显；连接蛋白使伸展性较小；
  - 骨骼肌：初长度储备小、降支明显。
- **边界**：生理情况下可用舒张末期压力近似反映容积；病理状态下压力与容积不能简单等同。

### KP06｜后负荷：出口压力突然变大

> **讲义定位 →** 生理 Lecture PDF P115
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：别称2｜左右室出口｜后负荷骤增6环节｜随后代偿2（条件）

#### 详细展开

- **2 个别称**：压力负荷 / 大动脉血压。
  - 左室看主动脉压；
  - 右室看肺动脉压。
- **本质**：心肌开始收缩后需要克服的出口压力。
- **后负荷突然↑的瞬间**
  - 以下按单因素、短时且总收缩时间近似固定的课程模型推演；实际时长还受心率与收缩性等共同影响。
  - 等容收缩期室压峰值↑；
  - 等容收缩期延长；
  - 射血期缩短；
  - 心肌缩短速度↓、缩短程度↓；
  - SV↓；
  - ESV↑。
- **随后代偿**
  1. 若舒张期静脉回心量未明显减少：ESV↑ → 次搏 EDV↑ → Frank–Starling 代偿；
  2. 心肌收缩能力可增强 → 等长调节。
- **题目入口**：动脉血压突然升高，首先按后负荷突然升高推导。

### KP07｜收缩性 vs 实际收缩力；异长 vs 等长

> **讲义定位 →** 生理 Lecture PDF P115–116
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：收缩性定义｜决定因素3组｜实际力3因素｜异长vs等长｜总和边界

#### 详细展开

- **心肌收缩能力/收缩性**：与前、后负荷相对无关的心肌内在特性。
- **收缩能力 3 组因素**
  1. **活化横桥数目**：胞质 Ca²⁺浓度、肌钙蛋白对 Ca²⁺亲和力；
  2. **横桥 ATP 酶活性**；
  3. **肌原纤维、能量代谢和功能蛋白水平等**。
- **实际心肌收缩力**：前负荷 + 后负荷 + 收缩能力共同决定；自主神经与体液因素通过这些环节起作用。
- **异长调节**：改变初长度；属于自身调节；通过 Frank–Starling 改变 SV。
- **等长调节**：不改变初长度，主要增强心肌收缩能力；常见于自主神经和体液调节。
- **易错点**：心肌没有骨骼肌式的时间总和、空间总和。

### KP08｜心输出量 CO / 心指数 CI / 心率

> **讲义定位 →** 生理 Lecture PDF P116–117
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：CO定义/值/公式｜CI定义/用途｜直接因素2｜HR→CO的范围/反转

#### 详细展开

- **CO = SV × HR**：一侧心室每分钟射出的血量，约 **5 L/min**。
- **CI = CO / 体表面积**：适合比较不同体表面积个体的心泵功能。
- **CO 两个直接因素**：SV、HR。
- **HR 在一定范围↑** → CO↑。
- **HR >180/min** → 心动周期尤其舒张期显著缩短 → 回心量↓ → EDV↓ → SV↓↓ → CO反而↓。
- 切入点：分析心率对机械循环的影响，先看**舒张期**。

### KP09｜心室充盈、主动舒张与房颤

> **讲义定位 →** 生理 Lecture PDF P117
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：充盈2来源/比例/条件｜弹性回缩链｜Ca²⁺回降链｜房颤损失＋快室率｜控率意义

#### 详细展开

- **心室充盈 2 部分（讲义正常静息近似）**
  - 心室舒张抽吸约 **75%**；
  - 心房收缩约 **25%**。
- **边界**：75% / 25% 是用于正常静息机械模型的近似，不是所有年龄、心率和心室顺应性状态下固定不变的比例；舒张功能受损、心室变硬或其他更依赖房缩的情境中，心房贡献可更重要。
- **舒张早期抽吸的机械基础**：收缩期连接蛋白等弹性结构储存势能；舒张早期弹性回缩 → 心室快速扩张 → 室内压下降 → 形成抽吸。
- **主动舒张**：舒张期胞质 Ca²⁺回降越快 → 心肌舒张越快 → 抽吸越强 → 心室充盈↑。
- **房颤**
  - 有效心房收缩消失 → 按上述教材正常近似可丢失约 25% 充盈；实际影响取决于心室顺应性、心率和对房缩的依赖程度；
  - 多数为快速型心律失常 → 舒张期进一步缩短；
  - 最终 CO↓。
- **治疗原则之一**：控制心室率，为心室充盈争取时间。

### KP10｜心泵功能储备

> **讲义定位 →** 生理 Lecture PDF P117
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：定义｜储备2类｜SV储备2支｜正常大小｜心衰3项变化

#### 详细展开

- **定义**：心输出量随代谢需要继续增加的能力。
- **2 类**：搏出量储备 + 心率储备。
- **搏出量储备**
  - 收缩期储备：增强心肌收缩能力，属于等长调节；
  - 舒张期储备：增加 EDV，属于异长调节。
- **正常**：收缩期储备 > 舒张期储备；正常心室腔不能无限扩张。
- **心衰**
  - 收缩期储备↓；
  - 舒张期储备已被动用、接近耗竭；
  - 心率储备↓，但通常仍残留一部分。

### KP11｜心脏做功

> **讲义定位 →** 生理 Lecture PDF P118
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：左右室量压功比较｜做功比较2情境｜高血压链｜CI vs 做功

#### 详细展开

- 左、右心室 SV 与 CO 基本相同，但肺动脉压约为主动脉压的 1/6 → **右室做功约为左室的 1/6**。
- **心脏做功适合比较**
  - 动脉血压不同的个体；
  - 同一个体动脉血压改变前后。
- **高血压**：后负荷↑ → 心脏做功↑。
- **对比**：比较不同体表面积个体的 CO，用 CI。

### KP12｜射血分数 EF

> **讲义定位 →** 生理 Lecture PDF P116
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：公式/正常值｜代偿期SV-EDV-EF链｜比SV敏感的原因

#### 详细展开

- **EF = SV / EDV**，正常约 **55%–65%**。
- 心室功能减退代偿期：
  - 初始 SV↓、ESV↑；
  - 心室腔扩大、EDV↑；
  - Frank–Starling 可暂时使 SV 接近正常；
  - 但 **EF↓**。
- 因此，与单看 SV 相比，EF 更敏感地反映心泵功能减退。

### KP13｜心功能检查：压力 / 容积 / 超声

> **讲义定位 →** 生理 Lecture PDF P118
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：压力评价地位｜容积首选｜超声收缩指标｜舒张指标/解释限度

#### 详细展开

- **压力评价金标准**：心导管。
- **容积评价首选**：超声心动图。
- **左室收缩功能**：LVEF。
- **左室舒张功能的基础坐标**：E/A（讲义写 e/a）。
  - 讲义正常方向：E/A >1；
  - **早期松弛受损的典型方向**：早期抽吸减弱，E波↓；心房代偿收缩增强，A波↑ → E/A <1，并可出现增强的 S4。
- **边界**：`E/A <1` 只能作为早期松弛受损的基础模式，不能机械等同“所有舒张功能障碍”。随年龄和病程变化可出现假性正常或限制性充盈，E/A 也可 ≥1；不能只凭 E/A 单独证明或排除 HFpEF。完整临床舒张功能 / 心衰证据归 B11。

### KP14｜PV 环：4 个变量怎么改

> **讲义定位 →** 生理 Lecture PDF P119
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：PV4变量｜EDV/ESV/压力/斜率｜几何量/SV｜单变量条件

#### 详细展开

| 改变 | PV 环变化 | 横径 / SV |
|---|---|---:|
| 前负荷↑ | EDV 向右，环变宽 | ↑ |
| 后负荷↑ | 收缩压升高、ESV 向右，环变高变窄 | ↓ |
| 收缩能力↑ | ESPVR 斜率↑、ESV 向左，环变宽 | ↑ |
| 顺应性↓ | 舒张期 P–V 关系左上移；相同充盈压下 EDV↓、环趋窄 | ↓ |

- **看图顺序**：先看横纵坐标 → 再找 EDV、ESV → 最后看横径即 SV。
- **边界 1**：上表是“单变量改变、其他决定因素近似不变”的方向模型；不要把“整只环固定平移”背成无条件规则。
- **边界 2**：收缩能力增强与前负荷增加都可使 SV↑，但前者改变收缩末期关系斜率并使 ESV↓，后者主要把 EDV 推向右侧。

### KP15｜3 类曲线 + 顺应性

> **讲义定位 →** 生理 Lecture PDF P119
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：长度—张力/张力—速度｜心室功能曲线｜压力—容积曲线｜收缩性/顺应性改图｜充盈受累段

#### 详细展开

- 骨骼肌收缩能力↑：
  - 长度–张力曲线上移；
  - 张力–速度曲线右上移。
- 心肌收缩能力↑ → 心室功能曲线左上移。
- 心肌顺应性↓ → 心室压力–容积曲线左上移：
  - 同样压力，容积更小；
  - 同样容积，压力更高。
- 顺应性C=ΔV/ΔP描述被动容积—压力关系，不等于主动舒张速度。课程原题将影响期概括为减慢充盈期和心房收缩期；应理解为晚期充盈受僵硬限制，不能说早期充盈完全不受影响。


### KP16｜四瓣膜病：时相 + 杂音形态｜短验证接口

> **讲义定位 →** 生理 Lecture PDF P121–122
> **Outline →** 生理 U009｜心脏泵血
> **主提示**：4瓣膜病｜时相｜杂音形态

- **MS**：舒张期低调隆隆样杂音，常有舒张末增强；不能把整个舒张期都画成单一递增线。
- **MR**：收缩期，一贯型。
- **AS**：收缩期，递增–递减型。
- **AR**：舒张期，递减型。

> 这里仅用异常血流验证心动周期；病因、重构、体征、超声和手术门槛归 B7。

---

## ③ 动脉与压力：血离开心脏以后怎么走

### KP17｜7 类血管功能分工

> **讲义定位 →** 生理 Lecture PDF P123
> **Outline →** 生理 U010｜血压
> **主提示**：7类：名称→结构→功能｜最重要｜病理细动脉对应｜AS危害最大类型

#### 详细展开

- **弹性储器血管**：主动脉、肺动脉主干及最大分支 → 储能、把间断射血变成连续血流、缓冲血压。
- **分配血管**：中动脉。
- **毛细血管前阻力血管**：小动脉、微动脉 → 最重要。
- **交换血管**：真毛细血管。
- **毛细血管后阻力血管**：较大微静脉 → 影响物质交换和回心。
- **短路血管**：动–静脉吻合支 → 调节体温。
- **容量血管**：静脉 → 容纳约 60%–70% 血量。
- **病理学“细动脉”**：对应微动脉。
- **动脉粥样硬化危害最大血管类型**：中动脉。

### KP18｜血流阻力 / 血液黏度

> **讲义定位 →** 生理 Lecture PDF P124
> **Outline →** 生理 U010｜血压
> **主提示**：R公式/主变量｜黏度4轴（条件）｜贫血链｜温度链

#### 详细展开

- **R ∝ ηL / r⁴**：黏度η↑、长度L↑ → R↑；半径r↑ → R显著↓。
- **最主要因素**：血管口径/半径。
- **血液黏度 4 个切入**
  - HCT↑ → 黏度↑，为最主要因素；
  - 切率↑ → 红细胞轴流更明显 → 黏度↓；
  - 在小血管且切率足够高时，血管口径变小可伴表观黏度下降，部分抵消阻力；
  - 温度↓ → 黏度↑。
- **贫血**：HCT↓ → 黏度↓ → R↓ → 可致高排量心衰。
- **冬季血栓性疾病较多**：温度↓ → 血液黏度↑。

### KP19｜微动脉 7 件事

> **讲义定位 →** 生理 Lecture PDF P124
> **Outline →** 生理 U010｜血压
> **主提示**：功能7项｜神经/阻力/压降/调压/分流｜收缩后5量联动

#### 详细展开

1. 微循环总闸门；
2. 交感缩血管神经纤维支配密度最大；
3. 血流阻力最大；
4. 血压下降幅度最大；
5. 调节动脉血压最主要；
6. 调节器官血流量最主要；
7. 微动脉收缩 → 器官血流↓、毛细血管压↓、组织液生成↓、淋巴回流↓、动静脉氧分压差↑。

### KP20｜动脉血压 4 个基本量

> **讲义定位 →** 生理 Lecture PDF P125
> **Outline →** 生理 U010｜血压
> **主提示**：SBP/DBP/PP/MAP｜定义/时点｜公式｜正常或理想值

#### 详细展开

- **SBP**：一个心动周期主动脉压最高值；快速射血期末；理想 <120 mmHg。
- **DBP**：主动脉压最低值；等容收缩期末；理想 <80 mmHg。
- **PP = SBP − DBP**；正常约 30–40 mmHg。
- **MAP = DBP + 1/3 PP**；因舒张期较长，MAP更接近DBP。

### KP21｜动脉压的生理变异

> **讲义定位 →** 生理 Lecture PDF P125
> **Outline →** 生理 U010｜血压
> **主提示**：年龄→SBP/DBP｜昼夜调节｜2高峰

#### 详细展开

- **年龄变化**：需分阶段。SBP常随年龄升高；DBP在中年前后可升高，老年随着大动脉僵硬可趋平或下降，脉压增宽。不能把“SBP、DBP都升高”外推到所有年龄。
- **昼夜节律**：下丘脑视交叉上核调节，呈双峰双谷。
- **两个高峰**：约 6–10时、16–20时。
- 高血压和大动脉硬化的方向变化不放在本 KP，统一回到下面的 5 因素矩阵理解。

### KP22｜动脉压形成与 5 因素方向矩阵

> **讲义定位 →** 生理 Lecture PDF P125–126
> **Outline →** 生理 U010｜血压
> **主提示**：形成条件4｜影响因素5｜储器作用2｜充盈压升高2路｜SBP/DBP/PP方向矩阵（条件）｜指标主反映

#### 详细展开

- **4 个形成条件**
  1. 足够血液充盈；
  2. 心脏射血；
  3. 外周阻力；
  4. 大动脉弹性储器。
- **5 个影响因素**：平均充盈压、SV、HR、TPR、大动脉弹性储器作用。
- **弹性储器 2 作用**
  - 把心脏间断射血转为血管连续血流；
  - 缓冲血压：SBP不至过高、DBP不至过低。
- **平均充盈压↑的两条路**：循环血量↑，或循环系统容积↓。

> **使用边界**：下面是经典“单因素改变、其余因素近似不变、HR 仍在生理可代偿范围”的方向矩阵。多因素疾病或极端心动过速不能直接套一格；例如 HR 过快导致充盈/SV下降时必须回 KP08 重算。

| 因素变化 | SBP | DBP | PP | 主要影响 |
|---|---:|---:|---:|---|
| 平均充盈压↑ | ↑↑ | ↑ | ↑ | SBP |
| SV↑ | ↑↑ | ↑ | ↑ | SBP |
| HR↑ | ↑ | ↑↑ | ↓ | DBP |
| TPR↑ | ↑ | ↑↑ | ↓ | DBP |
| 大动脉弹性储器作用↓ | ↑ | ↓ | ↑↑ | PP |

- **总体规律**：除弹性储器外，影响因素与 SBP、DBP 通常同向，只是幅度不同。
- **特殊**：弹性储器作用↓时，SBP↑而DBP↓。
- **指标反映（第一近似）**
  - SBP主要反映 SV / 射血；
  - DBP主要反映 TPR；
  - PP主要反映大动脉弹性储器作用。
- **边界**：这些是“主要决定因素”的定位语言，不表示某个压力指标只由单一变量决定。
- **疾病应用**
  - 高血压：SBP↑、DBP↑；
  - 大动脉粥样硬化/老年人大动脉硬化：弹性储器作用↓ → SBP↑、DBP↓、PP↑。


---

## ④ 静脉回心：血怎样回到泵

### KP23｜中心静脉压 CVP

> **讲义定位 →** 生理 Lecture PDF P126
> **Outline →** 生理 U010｜血压
> **主提示**：定义/正常值｜合力2端｜升降各2因｜右心射血↑→CVP/回心

#### 详细展开

- **定义**：右心房和胸腔大静脉的压力。
- **正常值**：4–12 cmH₂O。
- **反映**：右心射血能力与静脉回心血量之间的关系。
- **CVP↑**：回心血量↑，或右心射血能力↓。
- **CVP↓**：回心血量↓，或右心射血能力↑。
- **右心射血能力↑链**：舒张期室压↓ → 抽吸右房↑ → CVP↓ → 对外周静脉抽吸↑ → 回心血量↑。

### KP24｜静脉回心：一个模型 + 13 个方向

> **讲义定位 →** 生理 Lecture PDF P128–129
> **Outline →** 生理 U010｜血压
> **主提示**：回心压差｜抽吸6＋送血7｜突然站立链｜节律泵vs持续收缩

#### 详细展开

- **总模型**：外周静脉与右房/CVP之间的压力差越大，血越容易回到心脏。
- **方向表条件**：自主吸气与正压通气分开；心率从过快适当减慢才可能改善充盈，不能推出越慢越好。微动脉舒张促进回心的推演须近似维持驱动压；全身舒张若同时明显降压应重算。右房压降低后若回流通路受限，回流也不会无限增加。
- **抽吸端增强 → 回心↑**
  1. 右心射血能力↑；
  2. 吸气；
  3. 舒张期胞质 Ca²⁺回降速度↑；
  4. 心率↓；
  5. 心包压力↓；
  6. 心室顺应性↑。
- **送血端增强 → 回心↑**
  7. 血容量↑；
  8. 输液过多过快；
  9. 直立→平卧；
  10. 微动脉舒张；
  11. 静脉收缩；
  12. 走路/跑步的节律性肌肉泵；
  13. 站在深水中，水压产生类似肌肉泵作用。
- **反向改变** → 回心↓。
- **长期卧床后突然站立**：低垂部静脉扩张、血液淤积 → 回心↓ → 脑灌注↓ → 头晕、眼前发黑。
- **易错边界**：骨骼肌节律性舒缩促进回心；持续紧张性收缩反而可使回心下降。


---

## ⑤ 微循环交换：到了组织以后怎么交换

### KP25｜微循环：3 条通路 + 3 个闸门

> **讲义定位 →** 生理 Lecture PDF P130
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：闸门3｜通路3：结构/功能/分布/流速/开闭/交换｜营养路排除项｜局部vs器官调节｜暖休克接口

#### 详细展开

- **3 个闸门**
  - 微动脉＝总闸门；
  - 毛细血管前括约肌＝分闸门，决定真毛细血管血流；
  - 较大微静脉＝后闸门，影响毛细血管压、物质交换与回心。
- **迂回/营养通路**
  - 后微动脉 → 真毛细血管 → 微静脉；
  - 血流慢、周期性开闭；
  - 物质交换主通路；
  - 多见于肠系膜。
- **直捷通路**
  - 后微动脉 → 通血毛细血管 → 微静脉；
  - 血流快、常开放；
  - 仅少量交换，主要使血快速回流；
  - 多见于骨骼肌。
- **动静脉短路**
  - 动–静脉吻合支；
  - 血流快、通常关闭、高温时开放；
  - 无物质交换；
  - 多见于指趾、耳廓、唇鼻皮肤；参与体温调节。
- **物质交换主通路不流经**：通血毛细血管。
- **局部代谢产物主要调节**：后微动脉 + 毛细血管前括约肌。
- **器官血流主要调节血管**：微动脉。
- **暖休克（B12 接口）**：讲义用动静脉短路开放解释“有流量但有效交换不足”的一部分微循环现象；不要把它当成暖休克皮肤温暖的唯一机制。早期分布性 / 感染性休克还存在外周阻力下降与皮肤血流增多，完整休克模型归 B12。


### KP26｜组织液 / 淋巴 / 水肿

> **讲义定位 →** 生理 Lecture PDF P131
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：滤过压4力｜淋巴日量/功能4｜水肿入口4→例子

#### 详细展开

- **有效滤过压**

  （毛细血管血压 + 组织液胶体渗透压）
  −（组织液静水压 + 血浆胶体渗透压）

- **淋巴液**：约 2–4 L/d。
- **淋巴 4 功能**：回收蛋白质、运输脂类、调节体液平衡、防御免疫。
- **水肿 4 入口**
  1. 毛细血管静水压↑：心衰、淤血；
  2. 血浆胶体渗透压↓：肝病、肾病、营养不良；
  3. 毛细血管通透性↑：炎症、过敏、烧伤等；
  4. 淋巴回流受阻：丹毒象皮肿、乳腺癌橘皮样变、丝虫病。


---

## ⑥ 冠脉自供：心脏怎样给自己供血

### KP27｜冠脉：高耗氧 + 有效灌注压

> **讲义定位 →** 生理 Lecture PDF P132
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：摄氧特点｜左冠压差｜左右时相/条件

#### 详细展开

- 心肌持续做功、耗氧量大，静息摄氧率已高，冠脉动静脉氧差大。肌红蛋白参与细胞内氧的储存/传递，但不能把高耗氧量仅归因于“富含肌红蛋白”。
- **左冠有效灌注压的常用近似**：主动脉舒张压 − 左室舒张末期压；主要用于理解左室、尤其心内膜下灌注，并非整个冠脉流量的完整公式。
- **右冠灌注**：课程强调右室收缩压迫较小，因此收缩期也能灌注、主动脉收缩压有意义。不能据此认定整条右冠只看收缩压；右冠优势型、供血区域、右室压力和舒张期血流也影响灌注。
- **原因**
  - 左室壁厚，收缩期对心肌内冠脉小分支压迫明显，左室心肌灌注以舒张期为主，不能说收缩期全无血流；
  - 右室壁薄，收缩期压迫较小，收缩期也能灌注。

### KP28｜冠脉流量：3 因素 + 心动周期时相

> **讲义定位 →** 生理 Lecture PDF P132–133
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：流量因素3｜等容收缩/舒张方向｜峰值时相｜HR链｜TPR单因素固定条件｜供需边界

#### 详细展开

- **3 个主要因素**
  1. 舒张期长短；
  2. 舒张压大小；
  3. 冠脉舒张程度。
- **时相**
  - 等容收缩期室压上升最快 → 冠脉流量急剧↓；
  - 等容舒张期室压下降最快 → 冠脉流量急剧↑；
  - 舒张早期达高峰。
- **HR↑** → 舒张期缩短 → 冠脉流量↓。
- **TPR↑的单因素模型**：若冠脉自身阻力、HR、左室舒张末压等近似不变，TPR↑可先使 DBP↑ → 冠脉灌注压↑ → 冠脉流量↑。
- **边界**：不能把“TPR↑”机械理解成“心肌氧供一定改善”；真实病例中后负荷与心肌耗氧也可能同时↑，必须回到 `灌注压 + 冠脉阻力 + 舒张时间 + 耗氧` 一起判断。


### KP29｜冠脉调节：局部代谢是主角

> **讲义定位 →** 生理 Lecture PDF P133
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：主调节｜局部产物5｜舒/缩因素｜交感vs迷走：直接/总体｜大失血再分配

#### 详细展开

#### A. 心肌自己发出“缺氧/加血”信号

```text
交感兴奋 / 儿茶酚胺 / 甲状腺激素
→ 心肌代谢与耗氧↑
→ 腺苷、H⁺、CO₂、乳酸、缓激肽↑
→ 冠脉舒张
→ 冠脉流量↑
```

- **核心**：冠脉血流主要受心肌局部代谢调节，使供血与耗氧相匹配。

#### B. 其他血管活性因素

- **舒张冠脉**：NO、CGRP、ADM。
- **总体/主要效应记作收缩冠脉**：迷走神经、AngⅡ、大剂量 VP/ADH、ET。

#### C. 两个容易被“直接受体效应”骗到的边界

- **交感神经**：冠脉 α₁可直接收缩、β₂可直接舒张；但交感使心肌工作和代谢显著↑，腺苷等代谢性舒张占主导 → 最终冠脉流量↑。
- **迷走神经**：冠脉 M 受体可直接舒张；但迷走使心肌代谢↓、腺苷↓，间接收缩效应占主导 → 讲义按总体效应记为收缩。

#### D. 大失血时的血流再分配

- 交感使多数外周血管收缩；
- 冠脉局部代谢调节占主导，不随全身血管一起明显收缩；
- 脑血管受 O₂/CO₂ 等调节；
- 血流重新分配，优先保证心、脑供血。

---

# 临床验证接口｜心绞痛只用来验证冠脉供需模型

> 这里保留 KP30–KP32 的 canonical 身份，但它们不再是与正常循环六大段并列的“第十章”。第一次学习只需看懂它们怎样调用 B1 变量；冠心病 / ACS 的完整疾病模型、药物组合和治疗路径归 B6。

### KP30｜心绞痛的统一入口

> **讲义定位 →** 生理 Lecture PDF P133
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：供需失衡本质｜供氧2轴｜耗氧4轴｜疾病7场景

- **本质**：心肌氧供与耗氧不匹配。
- 可导致心绞痛的情境：冠心病、主动脉瓣狭窄、主动脉瓣关闭不全、高血压、肥厚型心肌病、肺栓塞、X 综合征。
- 做题时先问：
  - 是冠脉流量 / 灌注压下降？
  - 还是室壁张力、后负荷、心率、收缩力使耗氧增加？
  - 最终共同落到 **氧供 < 耗氧**。

### KP31｜β 受体阻断剂为何抗心绞痛

> **讲义定位 →** 生理 Lecture PDF P133
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：β₁主链｜供需2端｜舒张时间｜再分配次级链（适用边界）

1. **主机制**：阻断心脏 β₁ → 心率↓、收缩力↓ → 心肌耗氧↓。
2. 心率↓ → 舒张期↑ → 增加舒张期冠脉灌注时间，为供氧提供更有利条件。
3. **讲义次级链保留**：阻断 β₁使非缺血区代谢与腺苷↓；若同时存在冠脉 β₂ 阻断，非缺血区血管可相对收缩，而缺血区仍受局部代谢性舒张支配 → 有利于血流向缺血区重新分配。

> **边界**：第 3 条不是所有 β 受体阻断剂抗心绞痛都必须具备的统一主机制，尤其不能把“必须阻断 β₂”学成结论。第一优先级仍是 **降 HR / 降收缩力 → 降耗氧 + 延长舒张灌注时间**；完整冠心病药物选择归 B6。

### KP32｜硝酸酯抗心绞痛：供需两端

> **讲义定位 →** 生理 Lecture PDF P133
> **Outline →** 生理 U011｜微循环和冠脉
> **主提示**：靶血管3路｜前/后负荷｜张力/耗氧｜局部供氧｜固定狭窄边界

- **扩静脉（主要）** → 回心↓ → 前负荷↓ → 室壁张力↓、射血时间↓ → 心肌耗氧↓。
- **扩动脉（次要）** → 后负荷↓ → 室壁张力↓ → 心肌耗氧↓。
- **供氧端**：可舒张冠脉大血管、解除痉挛并改善侧支 / 局部灌注，从而有利于缺血区供氧。
- **边界**：固定严重冠脉狭窄时，不能把“扩冠脉”机械等同于“总冠脉流量必然↑”。B1 只保留供需变量方向；稳定性冠心病/ACS 的完整药理与治疗路径归 B6。


---

## 综合验收｜6 条反事实链

> 这里不是第 33 个知识点。先遮住答案，从前面的变量关系现场推出；推不出时再回对应 KP。

> **统一边界**：以下是为了练变量因果的“单因素反事实”。没有明确说明时，默认其余主要决定因素短时近似不变；真实病例若同时改变 HR、SV、TPR、静脉张力或心功能，必须重新运行整条链，不能把下列箭头当无条件定律。

### 1. 心动周期变短

在“HR 增加但尚未快到明显拖垮充盈 / SV”的单因素范围内：心动周期↓ → 舒张期↓ → 主动脉向外周流血时间↓ → 留在主动脉内的血↑ → **DBP↑↑、SBP↑、PP↓**。

> 若进入极端心动过速，SV 可因充盈不足明显下降，此时不能继续套这条链，回 KP08 重算 CO 与血压。

### 2. SV 减少

在 HR / TPR 等近似不变时：SV↓ → **SBP↓↓、DBP↓**。

### 3. 后负荷增大

后负荷↑ → SV↓、ESV↑。

- 本题按 Study 的定义：后负荷 = 大动脉血压，因此题干已经给出 **SBP/DBP↑**；
- 若题干明确给的是 TPR↑，再回 KP22：DBP升幅更大、PP↓。

### 4. 心脏射血能力瞬间增强

在回心量/静脉张力近似不变的短时模型中：心脏射血能力↑ → 动脉血压↑；舒张期室压↓、右房抽吸↑ → **CVP↓**。

### 5. 微动脉收缩

微动脉收缩 → TPR↑ → 动脉血压↑ → 后负荷↑ → 等容收缩期延长；同时局部/全身小动脉阻力上升可减少向静脉端的血流。

> **CVP 边界**：若心功能、静脉张力和血容量等近似不变，回心减少可使 CVP 倾向下降；真实状态下 CVP 是“回心量 ↔ 右心射血能力”的合成结果，不能仅凭 TPR 一项无条件判定，必须回 KP23。

### 6. 急性失血

```text
急性失血
→ 循环血量↓
→ 动脉血压↓、CVP↓

随后随着组织液回补、肾脏水钠潴留或外源补液
→ 血浆容量相对恢复快于红细胞总量
→ Hct 可下降
```

> **边界**：Hct 是血细胞容积占全血的比例，不能把“刚发生失血”机械等同于“瞬间 Hct 已下降”。


---

# B1 → B2 学习交接

B1 建立的是被调变量：

```text
HR / 收缩性 / SV / CO / MAP / TPR
静脉容量 / 静脉回心 / CVP / EDV
前负荷 / 后负荷 / 器官血流
```

B2 接下来回答谁来调它们：

```text
谁发现变量偏了？
→ 压力、化学、容量和缺血感受系统

中枢怎样发命令？
→ 交感 / 迷走

命令落到哪里？
→ 心脏、微动脉、静脉、肾球旁细胞

秒→天如何接力？
→ 自主神经 / 儿茶酚胺
→ RAAS / 醛固酮 / ADH / ANP-BNP
→ 肾容量

为什么长期会反噬？
→ 耗氧、前后负荷、水钠潴留和重构
```

> **总交接句**：B1 建立被调变量；B2 建立传感器—控制器—效应器—长期容量系统。

## 进入 B2 前的 12 个闭卷问题

1. `MAP ≈ CO × TPR` 中，交感可以分别从哪几个出口改变 MAP？
2. HR 增加为什么不是永远提高 CO？
3. 静脉收缩为什么会提高回心与前负荷？
4. 微动脉收缩为什么既提高 TPR，又减少局部血流？
5. 右心射血能力下降时，CVP 和回心会怎样？
6. 血容量下降时，平均充盈压、回心、EDV、SV、CO、MAP 怎样连续变化？
7. 前负荷增加与后负荷增加对 SV 的瞬时方向为何不同？
8. 收缩性增强怎样改变 ESV、SV 和 EF？
9. 为什么突然站立首先是静脉容量与回心问题？
10. 为什么长期血压不能只靠窦弓反射维持？
11. 为什么冠脉在全身交感升高时仍可能因局部代谢而舒张？
12. 为什么容量过多可以同时表现为 CVP↑、心房 / 心室壁牵张↑？

---

# Appendix｜来源、Memory 与执行信息

这些信息继续保留用于 Source / Runtime 对账，但不再挡在第一次学习主路上。

## B1 Primary 与边界

```text
生理 U009《心脏泵血》       51题
生理 U010《血压》           35题
生理 U011《微循环和冠脉》   30题
--------------------------------
合计                         116题

coverage = 116 / 116
orphan_scope = 0
duplicate_primary = 0
```

P0 已拥有：内环境与稳态、跨膜转运、细胞信号、一般细胞电活动、病理局部循环 / 炎症 / 修复。

### 短接口与后续完整 Primary

| B1 中的短接口 | B1 当前身份 | 完整 Primary 位置 |
|---|---|---|
| 四瓣膜杂音时相 | 用异常血流验证心动周期 | B7 |
| AS 血管类型 | 血管分工短接口 | B5 |
| 稳定缺血、硝酸酯、β阻断剂 | 冠脉供需验证 | B6 |
| 房颤对充盈 | 机械验证 | B10 |
| 心衰中的储备 / EF / 淤血 | 机械验证 | B11 |
| 暖休克、低灌注 | 微循环 failure 验证 | B12 |
| 水肿疾病举例 | 四入口验证 | 对应后续系统 |

## Memory Routing

### MI-G｜会阻断 B2–B12，必须即时掌握

1. 四个瓣膜开闭的压力门槛；
2. 心动周期七期和四个关键瓣膜事件；
3. 前负荷、后负荷、收缩性、顺应性的边界；
4. PV 环四种基本变化；
5. HR 过快为何损害充盈；
6. SBP / DBP / PP / MAP 各反映什么；
7. 动脉压 5 因素方向矩阵；
8. CVP 反映“回心量 vs 右心射血能力”；
9. 静脉回心的核心压力梯度；
10. 微动脉收缩对 TPR、局部血流、毛细血管压和氧提取的方向；
11. 水肿四入口；
12. 左冠主要依赖舒张期灌注。

### MI-D｜归位后可继续间隔复习

- 正常值：SV、CO、CI、EF、CVP、PP 等；
- 心动周期全部极值；
- 昼夜血压双峰；
- 静脉回心 13 个方向性因素的完整名单；
- 全部血管功能分类细项；
- 冠脉介质名单；
- 硝酸酯、β阻断剂等短临床接口的药名细节；
- 低频特殊与数字。

## 原图门禁

1. 心动周期压力—容积环；
2. 心动周期时相总表；
3. PV 环与三类曲线；
4. 动脉压五因素矩阵；
5. 静脉回心整合图；
6. 微循环三通路；
7. 组织液、淋巴与水肿；
8. 冠脉灌注 / 代谢调节；
9. 冠脉调节与硝酸酯供需图；
10. B1 综合变量图。

## v7 身份说明

- 当前显式 KP：KP01–KP32；
- “综合验收”不另造 KP33；
- 本轮结构优化没有改变 Primary、KP 身份或后续 Block 所有权；
- B1 的任务是成为 B2–B12 可随时调用的稳定机械模型。
