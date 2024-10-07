export enum WeekStartDay {
    SUNDAY = 'SUNDAY',
    MONDAY = 'MONDAY',
}

export class SimpleDate {

    private readonly raw: string

    private readonly timezoneOffset: number

    constructor(value: string|SimpleDate|Date|undefined, timezoneOffset?: number) {
        if (timezoneOffset !== undefined) {
            this.timezoneOffset = -timezoneOffset
        } else {
            this.timezoneOffset = (new Date().getTimezoneOffset())
        }

        this.raw = '0000-01-01'

        switch (typeof value) {
            case 'undefined': {
                this.raw = SimpleDate.today().getRaw()
                break
            }

            case 'string': {
                const matches = /^(\d+)-(\d+)-(\d+)/.exec(value)

                if (!matches) {
                    // we can't parse it, falling back to default JS parser
                    throw new Error('')
                }

                this.raw = matches[0]

                break
            }

            case "object":
                if (value instanceof SimpleDate) {
                    this.raw = value.getRaw()
                }

                if (value instanceof Date) {
                    this.raw = value.toISOString().split('T')[0]

                    if (timezoneOffset !== undefined) {
                        this.timezoneOffset = -timezoneOffset
                    } else {
                        this.timezoneOffset = value.getTimezoneOffset()
                    }
                }

                break
        }
    }

    static create = (year: number, month: number, day: number) => {
        year = Math.round(year)
        month = Math.round(month)
        day = Math.round(day)

        if (month > 12) {
            month = 12
        }

        if (month < 1) {
            month = 1
        }

        if (day < 0) {
            day = 1
        }

        const countOfDaysInMonth = SimpleDate.daysInMonth(month, year)
        if (day > countOfDaysInMonth) {
            day = countOfDaysInMonth
        }

        const y = padStart(year, 4, '0')
        const m = padStart(month, 2, '0')
        const d = padStart(day, 2, '0')

        return new SimpleDate(`${y}-${m}-${d}`)
    }

    static today = () => new SimpleDate(new Date())

    static tomorrow = () => new SimpleDate(new Date()).nextDay()

    static yesterday = () => new SimpleDate(new Date()).previousDay()

    static todayInTimeZoneWithOffset = (offset: number) => new SimpleDate(new Date(), offset)

    firstDayOfWeek = (weekStartDay: WeekStartDay) => {
        switch (weekStartDay) {
            case WeekStartDay.SUNDAY: {
                let dayOfWeek = this.getDayOfWeek()
                return this.addDays(-dayOfWeek)
            }
            case WeekStartDay.MONDAY: {
                // processing case of sunday specifically (in the USA it's a beginning of the next week, but in Europe it's the end of week)
                let dayOfWeek = this.getDayOfWeek()
                return this.addDays(dayOfWeek == 0 ? -6 : 1 - dayOfWeek)
            }
        }
    }

    firstDayOfWeekInEurope = () => this.firstDayOfWeek(WeekStartDay.MONDAY)

    firstDayOfWeekInAmerica = () => this.firstDayOfWeek(WeekStartDay.SUNDAY)

    /** @deprecated */
    static now = SimpleDate.today

    static zero = () => new SimpleDate('0000-01-01')

    equals = (other: SimpleDate) => this.raw === other.getRaw()

    lessThan = (other: SimpleDate) => this.raw < other.getRaw()

    lessThanOrEqual = (other: SimpleDate) => this.raw <= other.getRaw()

    greaterThan = (other: SimpleDate) => this.raw > other.getRaw()

    greaterThanOrEqual = (other: SimpleDate) => this.raw >= other.getRaw()

    isBetweenExclusive = (first: SimpleDate, second: SimpleDate) => this.greaterThan(first) && this.lessThan(second)

    isBetweenInclusive = (first: SimpleDate, second: SimpleDate) => this.greaterThanOrEqual(first) && this.lessThanOrEqual(second)

    daysBetween = (other: SimpleDate) => {
        const diffTime = other.toJsDate().getTime() - this.toJsDate().getTime()
        const msInDay = 24 * 60 * 60 * 1000
        return Math.round(diffTime / msInDay)
    }

    toString = () => this.raw

    getIsoDate = () => {
        const sign = this.timezoneOffset < 0 ? '+' : '-'
        const abs = Math.abs(this.timezoneOffset)
        const hourOffset = padStart(Math.round(abs / 60), 2, '0')
        const minuteOffset = padStart(abs % 60, 2, '0')
        const timeZoneOffset = hourOffset + ':' + minuteOffset
        return this.raw + 'T00:00:00.000' + sign + timeZoneOffset
    }

    toJsDate = () => {
        const isoDate = this.getIsoDate()
        return new Date(isoDate)
    }

    toJsDateInUTC = () => new Date(this.raw + 'T00:00:00.000' + 'Z');

    toTimestamp = () => this.toJsDateInUTC().getTime()

    getRaw = () => this.raw

    getYear = (): number => Number(this.raw.split('-')[0])

    getMonth = (): number => Number(this.raw.split('-')[1])

    getDayOfMonth = (): number => Number(this.raw.split('-')[2])

    getDayOfWeek = (): number => this.toJsDate().getDay() // in the Date object getDay() returns the day of the week

    getDayNameInEnglish = (): string => {
        const day = this.getDayOfWeek()
        switch (day) {
            case 0: return 'Sunday'
            case 1: return 'Monday'
            case 2: return 'Tuesday'
            case 3: return 'Wednesday'
            case 4: return 'Thursday'
            case 5: return 'Friday'
            case 6: return 'Saturday'
            default: return '[Error]'
        }
    }

    getFullMonth = () => {
        const [year, month] = this.raw.split('-')
        return `${year}-${month}`
    }

    getFullSemester = () => {
        const [year, rawMonth] = this.raw.split('-')

        const month = parseInt(rawMonth, 10)

        if (month >= 1 && month <= 6) {
            return `${year}-01 — ${year}-06`
        }
        if (month >= 7 && month <= 12) {
            return `${year}-07 — ${year}-12`
        }

        return ''
    }

    getFullQuarter = () => {
        const [year, rawMonth] = this.raw.split('-')

        const month = parseInt(rawMonth, 10)

        if (month >= 1 && month <= 3) {
            return `${year}-01 — ${year}-03`
        }
        if (month >= 4 && month <= 6) {
            return `${year}-04 — ${year}-06`
        }
        if (month >= 7 && month <= 9) {
            return `${year}-07 — ${year}-09`
        }
        if (month >= 10 && month <= 12) {
            return `${year}-10 — ${year}-12`
        }

        return ''
    }

    getComponents(): {year: number, month: number, day: number} {
        return {
            year: this.getYear(),
            month: this.getMonth(),
            day: this.getDayOfMonth()
        }
    }

    addDays = (count: number) => {
        count = Math.round(count)

        if (count > 0) {
            return this._addDays(count)
        } else if (count < 0) {
            return this._subtractDays(Math.abs(count))
        } else {
            return new SimpleDate(this.raw)
        }
    }

    previousDay = () => this.addDays(-1)

    nextDay = () => this.addDays(1)

    protected _addDays = (count: number) => {
        let year = this.getYear()
        let month = this.getMonth()
        let day = this.getDayOfMonth()

        while (count-- > 0) {
            day++
            if (day > SimpleDate.daysInMonth(month, year)) {
                day = 1
                month++

                if (month > 12) {
                    month = 1
                    year++
                }
            }
        }

        return SimpleDate.create(year, month, day)
    }

    protected _subtractDays = (count: number) => {
        let year = this.getYear()
        let month = this.getMonth()
        let day = this.getDayOfMonth()

        while (count-- > 0) {
            day--
            if (day < 1) {
                month--

                if (month < 1) {
                    month = 12
                    year--
                }

                day = SimpleDate.daysInMonth(month, year)
            }

        }

        return SimpleDate.create(year, month, day)
    }

    protected static daysInMonth = (month: number, year: number) => {
        switch (month) {
            case 1: return 31
            case 2: return year % 4 === 0 ? 29 : 28
            case 3: return 31
            case 4: return 30
            case 5: return 31
            case 6: return 30
            case 7: return 31
            case 8: return 31
            case 9: return 30
            case 10: return 31
            case 11: return 30
            case 12: return 31
            default: return 0
        }
    }

    addMonths = (count: number) => {
        count = Math.round(count)

        if (count > 0) {
            return this._addMonths(count)
        } else if (count < 0) {
            return this._subtractMonths(Math.abs(count))
        } else {
            return new SimpleDate(this.raw)
        }
    }

    protected _addMonths = (count: number) => {
        let year = this.getYear()
        let month = this.getMonth()
        const day = this.getDayOfMonth()

        while (count-- > 0) {
            month++

            if (month > 12) {
                month = 1
                year++
            }
        }

        return SimpleDate.create(year, month, day)
    }

    protected _subtractMonths = (count: number) => {
        let year = this.getYear()
        let month = this.getMonth()
        const day = this.getDayOfMonth()

        while (count-- > 0) {
            month--

            if (month < 1) {
                month = 12
                year--
            }
        }

        return SimpleDate.create(year, month, day)
    }

    addYears = (count: number) => {
        const year = this.getYear()
        const month = this.getMonth()
        const day = this.getDayOfMonth()

        return SimpleDate.create(year + count, month, day)
    }

    isToday = (): boolean => this.equals(new SimpleDate(new Date()))

}


const padStart = (value: number, count: number, padCharacter: string = '0') => {
    let result = String(value)
    while (result.length < count) {
        result = padCharacter + result
    }
    return result
}
