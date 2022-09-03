import { PluggitClient, SpeedLevel } from '@busse/pluggit'
import { PlatformAccessory } from 'homebridge'
import { PluggitPlatform } from './platform'
import { REFRESH_INTERVAL } from './settings'

export class PluggitApAccessory {
  #lastSpeedLevel?: SpeedLevel

  constructor(
    private readonly platform: PluggitPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ap: PluggitClient,
  ) {
    const {
      Characteristic: {
        Active,
        FirmwareRevision,
        Manufacturer,
        Model,
        Name,
        RotationSpeed,
        SerialNumber,
      },
      Service: { AccessoryInformation },
    } = this.platform

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const service = accessory.getService(AccessoryInformation)!

    service.setCharacteristic(Manufacturer, 'Pluggit')

    service.getCharacteristic(Model).onGet(() => this.ap.getUnitType())
    service
      .getCharacteristic(SerialNumber)
      .onGet(async () => (await this.ap.getSerialNumber()).toString())
    service
      .getCharacteristic(FirmwareRevision)
      .onGet(() => this.ap.getFirmwareVersion())
    service.getCharacteristic(Name).onGet(() => this.ap.getSystemName())

    const fanService =
      accessory.getService(platform.Service.Fanv2) ||
      accessory.addService(platform.Service.Fanv2)

    fanService
      .getCharacteristic(RotationSpeed)
      .setProps({
        format: 'int',
        minValue: 0,
        maxValue: 4,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        validValues: [0, 1, 2, 3, 4],
        unit: 'absolute',
      })
      .onGet(() => ap.getSpeedLevel())
      .onSet(async (value) => {
        this.#lastSpeedLevel = value as SpeedLevel
        await this.ap.setSpeedLevel(value as SpeedLevel)
      })

    fanService
      .getCharacteristic(Active)
      .onGet(() => this.ap.getSpeedLevel().then((speedLevel) => speedLevel > 0))
      .onSet(async (value) => {
        const currentSpeedLevel = await ap.getSpeedLevel()

        if (value === 1 && currentSpeedLevel === 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await this.ap.setSpeedLevel(this.#lastSpeedLevel!)
        } else if (value === 0 && currentSpeedLevel > 0) {
          await this.ap.setSpeedLevel(0)
        }
      })

    fanService
      .getCharacteristic(Name)
      .onGet(async () => this.ap.getSystemName())

    setInterval(() => {
      void this.ap
        .getSpeedLevel()
        .then((speedLevel) =>
          fanService.updateCharacteristic(RotationSpeed, speedLevel),
        )
    }, REFRESH_INTERVAL)

    this.#createSwitches()

    this.#createTemperature('Outdoor T1', 't1', 'getOutdoorTemperatureT1')
    this.#createTemperature('Supply T2', 't2', 'getSupplyTemperatureT2')
    this.#createTemperature('Extract T3', 't3', 'getExtractTemperatureT3')
    this.#createTemperature('Exhaust T4', 't4', 'getExhaustTemperatureT4')

    this.#createFilterMaintenance()

    fanService.setPrimaryService(true)
  }

  #createSwitches() {
    const manualModeSwitch = new this.platform.Service.Switch(
      'Manual',
      'manual',
    )

    const manualSwitchService =
      this.accessory.services.find((s) => s.subtype === 'manual') ??
      this.accessory.addService(manualModeSwitch)

    manualSwitchService
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => this.ap.isManualModeActive())
      .onSet(async (value) => {
        if (value) {
          this.platform.log.info('enable manual mode')
          await this.ap.setManualMode()
          awaySwitchService
            .getCharacteristic(this.platform.Characteristic.On)
            .updateValue(false)
        } else {
          this.platform.log.info('disable manual mode')
          await this.ap.disableManualMode()
        }
      })

    const AwayModeSwitch = new this.platform.Service.Switch('Away', 'away')

    const awaySwitchService =
      this.accessory.services.find((s) => s.subtype === 'away') ??
      this.accessory.addService(AwayModeSwitch)

    awaySwitchService
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => this.ap.isAwayModeActive())
      .onSet(async (value) => {
        if (value) {
          this.platform.log.info('enable away mode')
          await this.ap.setAway()
          manualSwitchService
            .getCharacteristic(this.platform.Characteristic.On)
            .updateValue(false)
        } else {
          this.platform.log.info('disable away mode')
          await this.ap.disableAway()
        }
      })
  }

  #createFilterMaintenance() {
    const filterMaintenance = new this.platform.Service.FilterMaintenance(
      'Pluggit Filter',
      'filterMaintenance',
    )

    const service =
      this.accessory.services.find((s) => s.subtype === 'filterMaintenance') ??
      this.accessory.addService(filterMaintenance)

    service
      .getCharacteristic(this.platform.Characteristic.FilterChangeIndication)
      .onGet(async () => {
        const remainingDays = await this.ap.getRemainingFilterDays()
        const thresholdDays = 30

        return remainingDays <= thresholdDays
          ? this.platform.Characteristic.FilterChangeIndication.CHANGE_FILTER
          : this.platform.Characteristic.FilterChangeIndication.FILTER_OK
      })

    service
      .getCharacteristic(this.platform.Characteristic.FilterLifeLevel)
      .onGet(async () => {
        const remainingDays = await this.ap.getRemainingFilterDays()

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return (remainingDays / 365) * 100
      })
  }

  #createTemperature(caption: string, id: string, method: keyof PluggitClient) {
    const sensor = new this.platform.Service.TemperatureSensor(caption, id)

    const service =
      this.accessory.services.find((s) => s.subtype === id) ??
      this.accessory.addService(sensor)

    service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .onGet(() => this.ap[method]() as Promise<number>)

    service
      .getCharacteristic(this.platform.Characteristic.Name)
      .onGet(() => caption)

    service
      .getCharacteristic(this.platform.Characteristic.StatusActive)
      .onGet(() => true)

    return service
  }
}
