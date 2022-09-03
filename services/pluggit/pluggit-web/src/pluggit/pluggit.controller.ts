import { PluggitClient, SpeedLevel } from '@busse/pluggit'
import { Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { setTimeout } from 'timers/promises'

@Controller()
export class PluggitController {
  constructor(
    @InjectPinoLogger(PluggitController.name)
    private readonly logger: PinoLogger,
    private readonly pluggit: PluggitClient,
  ) {}

  @Get()
  async index() {
    return {
      speedLevel: await this.pluggit.getSpeedLevel(),
      modes: {
        current: await this.pluggit.getCurrentUnitMode(),
        manual: await this.pluggit.isManualModeActive(),
        away: await this.pluggit.isAwayModeActive(),
      },
      fan1Speed: await this.pluggit.getFan1Speed(),
      fan2Speed: await this.pluggit.getFan2Speed(),
      system: {
        name: await this.pluggit.getSystemName(),
        currentDate: await this.pluggit.getCurrentDate(),
        firmwareVersion: await this.pluggit.getFirmwareVersion(),
        serialNumber: await this.pluggit.getSerialNumber(),
        installationDate: await this.pluggit.getInstallationDate(),
        remainingFilterDays: await this.pluggit.getRemainingFilterDays(),
        ipAddress: await this.pluggit.getIpAddress(),
        macAddress: await this.pluggit.getMacAddress(),
        unitType: await this.pluggit.getUnitType(),
        installedComponents: await this.pluggit.getInstalledComponents(),
        workTimeInHours: await this.pluggit.getWorkTimeInHours(),
      },
      bypass: {
        state: await this.pluggit.getBypassState(),
        shouldOpen: await this.pluggit.shouldBypassOpen(),
        shouldClose: await this.pluggit.shouldBypassClose(),
        durationInMinutes:
          await this.pluggit.getManualBypassDurationInMinutes(),
      },
      temperatures: {
        outdoorT1: await this.pluggit.getOutdoorTemperatureT1(),
        supplyT2: await this.pluggit.getSupplyTemperatureT2(),
        extractT3: await this.pluggit.getExtractTemperatureT3(),
        exhaustT4: await this.pluggit.getExhaustTemperatureT4(),
      },
    }
  }

  @Get('/test')
  test() {
    return Promise.all([this.index(), this.index(), this.index()])
  }

  @Get('/speed-level')
  getSpeedLevel() {
    return this.pluggit.getSpeedLevel()
  }

  @Put('/speed-level/:level')
  async setSpeedLevel(@Param('level') level: SpeedLevel) {
    this.logger.info('Setting speed level to %d', level)
    await this.pluggit.setSpeedLevel(level)
  }

  @Put('/unit-mode/:mode')
  async setUnitMode(@Param('mode', ParseIntPipe) mode: number) {
    await this.pluggit.setUnitMode(mode)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await setTimeout(200)

    return {
      speedLevel: await this.pluggit.getSpeedLevel(),
      mode: await this.pluggit.getCurrentUnitMode(),
    }
  }

  @Put('/manual-bypass')
  async setManualBypass() {
    await this.pluggit.setManualBypass()
  }

  @Put('/name/:name')
  async setName(@Param('name') name: string) {
    await this.pluggit.setSystemName(name)
  }
}
