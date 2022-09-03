/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Register, RegisterCategory, RegisterType } from './pluggit.interfaces'

export const Registers: Register[] = [
  {
    id: 473,
    name: 'prmCurrentBLState',
    description: 'Current unit mode',
    type: RegisterType.Int16,
    category: RegisterCategory.ModeOfOperation,
  },
  {
    id: 29,
    name: 'prmCurrentIPAddress',
    description: 'IP address',
    type: RegisterType.Int32,
    category: RegisterCategory.Communication,
  },
  {
    id: 41,
    name: 'prmMACAddr',
    type: RegisterType.Int32,
    category: RegisterCategory.Communication,
    length: 4,
  },
  {
    id: 445,
    name: 'prmBypassTmin',
    description: 'Min temperature for outdoor air (T1) ',
    type: RegisterType.Float,
    category: RegisterCategory.Bypass,
  },
  {
    id: 447,
    name: 'prmBypassTmax',
    description: 'Max temperature for extract air (T3) ',
    type: RegisterType.Float,
    category: RegisterCategory.Bypass,
  },
  {
    // 0: Closed 0x0000
    // 1: In process 0x0001
    // 32: Closing 0x0020
    // 64: Opening 0x0040
    // 255: Opened 0x00FF
    id: 199,
    name: 'prmRamIdxBypassActualState',
    description: 'Bypass state',
    type: RegisterType.Int16,
    category: RegisterCategory.Bypass,
  },
  {
    id: 325,
    name: 'prmRomIdxSpeedLevel',
    description:
      '0 Speed level of Fans. Manual mode: Fan step can be set. Other modes: Fan step can be read.',
    type: RegisterType.Int16,
    category: RegisterCategory.FanInfo,
  },
  {
    id: 265,
    name: 'prmRamIdxBypassManualTimeout',
    description: 'Manual bypass duration in minutes',
    type: RegisterType.Int16,
    category: RegisterCategory.Bypass,
  },
  {
    id: 133 + 1,
    name: 'prmRamIdxT1',
    description: 'Outdoor temperature T1, °C',
    category: RegisterCategory.Temperature,
    type: RegisterType.Float,
  },
  {
    id: 135 + 1,
    name: 'prmRamIdxT2',
    description: 'Supply temperature T2 °C ',
    category: RegisterCategory.Temperature,
    type: RegisterType.Float,
  },
  {
    id: 137 + 1,
    name: 'prmRamIdxT3',
    description: 'Extract temperature T3, °C ',
    category: RegisterCategory.Temperature,
    type: RegisterType.Float,
  },
  {
    id: 139 + 1,
    name: 'prmRamIdxT4',
    description: 'Exhaust temperature T5, °C ',
    category: RegisterCategory.Temperature,
    type: RegisterType.Float,
  },
  // {
  //   name: 'prmRamIdxT5',
  //   description: 'Room temperature wireless remote T5, °C ',
  //   register: 141,
  //   category: SensorCategory.Temperature,
  //   type: SensorType.Float,
  // },
  {
    id: 101 + 1,
    name: 'prmHALTaho1',
    description: 'Fan1 rpm',
    category: RegisterCategory.FanInfo,
    type: RegisterType.Float,
  },
  {
    id: 103 + 1,
    name: 'prmHALTaho2',
    description: 'Fan2 rpm',
    category: RegisterCategory.FanInfo,
    type: RegisterType.Float,
  },
  {
    id: 669,
    name: 'prmStartExploitationDateStamp',
    description:
      'Date Stamp of the system start of Exploitation in Unix time (amount of seconds from 1.1.1970)',
    category: RegisterCategory.FanInfo,
    type: RegisterType.Date,
  },
  {
    id: 109,
    name: 'prmDateTime',
    description:
      'Current Date/time in Unix time (amount of seconds from 1.1.1970)',
    category: RegisterCategory.TimeAndDate,
    type: RegisterType.Date,
  },
  {
    id: 625,
    name: 'prmWorkTime',
    description: 'Work time of system, in hours',
    category: RegisterCategory.TimeAndDate,
    type: RegisterType.Int32,
  },
  {
    id: 5,
    name: 'prmSystemSerialNum',
    description: 'system serial number',
    category: RegisterCategory.FanInfo,
    type: RegisterType.Int32,
    length: 8,
  },
  {
    id: 25,
    name: 'prmFWVersion',
    description: 'FW version',
    category: RegisterCategory.FanInfo,
    type: RegisterType.Int32,
  },
  {
    id: 9,
    name: 'prmSystemName',
    description: 'System name in ASCII prmSystemName',
    category: RegisterCategory.FanInfo,
    type: RegisterType.String,
    length: 16,
  },
  {
    id: 555,
    name: 'prmFilterRemainingTime',
    description: 'Remaining time of the Filter Lifetime (Days) ',
    type: RegisterType.Int16,
    category: RegisterCategory.Filter,
  },
  {
    id: 3,
    name: 'prmSystemID',
    description: 'Packed System Information',
    type: RegisterType.Int32,
    category: RegisterCategory.Filter,
  },
]
