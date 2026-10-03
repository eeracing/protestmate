export const INCIDENT_TYPES = Object.freeze([
  { value: "intentional_wrecking", uiLabel: "故意、报复性或恶意撞击 / Retaliation or Intentional Wrecking" },
  { value: "blocking", uiLabel: "阻挡 / Blocking" },
  { value: "unsafe_rejoin", uiLabel: "危险重返赛道 / Unsafe Rejoin" },
]);

export const SESSION_TYPES = Object.freeze([
  { value: "race", uiLabel: "正赛", aiLabel: "Race" },
  { value: "qualifying", uiLabel: "排位", aiLabel: "Qualifying" },
  { value: "practice", uiLabel: "练习", aiLabel: "Practice" },
]);

export const OUTCOMES = Object.freeze([
  { value: "avoided_contact", uiLabel: "成功避让，无接触", aiLabel: "Avoided contact" },
  { value: "contact", uiLabel: "发生接触", aiLabel: "Contact" },
  { value: "loss_of_control", uiLabel: "失控", aiLabel: "Lost control" },
  { value: "spin", uiLabel: "打转", aiLabel: "Spun" },
  { value: "off_track", uiLabel: "冲出赛道", aiLabel: "Went off track" },
  { value: "slowed_significantly", uiLabel: "明显减速", aiLabel: "Had to slow significantly" },
  { value: "time_lost", uiLabel: "损失时间", aiLabel: "Lost time" },
  { value: "damage", uiLabel: "车辆受损", aiLabel: "Vehicle damage" },
  { value: "pit_stop", uiLabel: "被迫进站", aiLabel: "Required a pit stop" },
  { value: "tow_for_repairs", uiLabel: "拖车维修", aiLabel: "Required towing for repairs" },
  { value: "positions_lost", uiLabel: "损失名次", aiLabel: "Positions lost" },
  { value: "retired", uiLabel: "退赛", aiLabel: "Retirement" },
  { value: "other", uiLabel: "其他", aiLabel: "Other consequence described in the additional context" },
]);

export const OUTCOME_CONFLICTS = Object.freeze([["avoided_contact", "contact"]]);
