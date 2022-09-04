export enum RegisterType {
  Float,
  Int32,
  Int16,
  Date,
  String,
}

export interface Register {
  name: string
  description?: string
  id: number
  category: RegisterCategory
  type: RegisterType
  length?: number
}

export enum RegisterCategory {
  Communication,
  VentilationUnitInfo,
  SoftwareVersion,
  TimeAndDate,
  ModeOfOperation,
  FanInfo,
  Temperature,
  Filter,
  Alaram,
  WeekProgram,
  NightMode,
  Bypass,
  Preheater,
  ComissioningSetting,
  VocSensor,
  RhSensor,
  HacPart,
}

export interface SensorValue {
  sensor: Register
  value: number
}

export enum UnitModeWrite {
  Demand = 0x0002,
  Manual = 0x0004,
  WeekProgram = 0x0008,

  EnableNightMode = 0x0020,
  DisableNightMode = 0x8020,

  SelectManualBypass = 0x0080,
  DeselectManualBypass = 0x8080,

  StartAwayMode = 0x0010,
  EndAwayMode = 0x8010,

  StartFireplaceMode = 0x0040,
  EndFireplaceMode = 0x8040,

  StartSummerMode = 0x0800,
  EndSummerMode = 0x8800,
}

export enum UnitModeRead {
  Standby = 0,
  Manual = 1,
  Demand = 2,
  WeekProgram = 3,
  ServoFlow = 4,
  Away = 5,
  Summer = 6,
  DiOverride = 7,
  HygrostatOverride = 8,
  Fireplace = 9,
  Installer = 10,
  FailSafe1 = 11,
  FailSafe2 = 12,
  FailOff = 13,
  DefrostOff = 14,
  Defrost = 15,
  Night = 16,
}

export type SpeedLevel = 0 | 1 | 2 | 3 | 4

export enum Components {
  FP1 = 0x0001,
  Week = 0x0002,
  Bypass = 0x0004,
  LRSwitch = 0x0008,
  InternalPreheater = 0x0010,
  ServoFlow = 0x0020,
  RhSenser = 0x0040,
  VocSensor = 0x0080,
  ExtOverride = 0x0100,
  HAC1 = 0x0200,
  HRC2 = 0x0400,
  PcTool = 0x0800,
  Apps = 0x1000,
  ZigBee = 0x2000,
  DI1Override = 0x4000,
  DI2Override = 0x8000,
}

export enum UnitType {
  // WG200 = 1,
  // WG300 = 2,
  // WG500 = 3,
  // HCC2 = 4,
  // HCC2ALU = 5,

  // http://docplayer.net/storage/103/160952723/160952723.pdf
  AP190 = 1,
  AP310 = 2,
  AP460 = 3,
  DG160 = 4,
  DAH190 = 5,
  DAH310 = 6,
  DAH460 = 7,
  DAH160 = 8,
}

export enum BypassState {
  'Closed' = 0,
  'In process' = 1,
  'Closing' = 32,
  'Opening' = 64,
  'Opened' = 255,
}
