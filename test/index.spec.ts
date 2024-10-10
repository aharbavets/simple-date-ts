import {describe, it} from 'mocha'
import {assert} from 'chai'
import {SimpleDate, WeekStartDay} from '../index'

describe('index', () => {

    describe('new SimpleDate() without parameters', () => {
        it('new SimpleDate() without parameters should be today (except super rare cases when the test is running at the time 23:59:59.999)', () => {
            assert.equal(SimpleDate.today().isToday(), true)
        })
    })

    describe('new SimpleDate(new Date("2024-10-07T08:21:00.000-07:00"))', () => {
        // Testing Pacific time on example of October 7, 2024.
        // This date is daylight saving time, so the offset is -07:00 (otherwise it would be -08:00).
        let simpleDate = new SimpleDate(new Date(`2024-10-07T08:21:00.000-07:00`))

        it('year should be 2024', () => {
            assert.equal(simpleDate.getYear(), 2024)
        })
        it('Month should be 10', () => {
            assert.equal(simpleDate.getMonth(), 10)
        })
        it('Day of month should be 7', () => {
            assert.equal(simpleDate.getDayOfMonth(), 7)
        })
    })

    describe('new SimpleDate(new Date("2024-10-07T08:21:00.000-07:00")).toJsDate().toLocaleDateString()', () => {
        const date = new Date(`2024-10-07T08:21:00.000-07:00`)
        const simpleDate = new SimpleDate(date)

        it('date.getDate() should be 7', () => {
            assert.equal(date.getDate(), 7)
        })

        it('Year should be 2024', () => {
            assert.equal(simpleDate.getYear(), 2024)
        })

        it('Month should be 10', () => {
            assert.equal(simpleDate.getMonth(), 10)
        })

        it('Day of month should be 7', () => {
            assert.equal(simpleDate.getDayOfMonth(), 7)
        })

        it('should return Mon, Oct 7', () => {
            const localeDateString = simpleDate.toJsDate().toLocaleDateString('en-us', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })

            assert.equal(localeDateString, 'Mon, Oct 7')
        })
    })

    // Run this test in UTC-07:00
    describe('new SimpleDate(new Date("2024-10-20T08:21:00.000-07:00")).toJsDate().toLocaleDateString()', () => {
        const date = new Date(`2024-10-15T20:21:22.000-07:00`)
        const simpleDate = new SimpleDate(date)

        it('date.getDate() should be 15', () => {
            assert.equal(date.getDate(), 15)
        })

        it('getRaw() should be 2024-10-15', () => {
            assert.equal(simpleDate.getRaw(), '2024-10-15')
        })

        it('year should be 2024', () => {
            assert.equal(simpleDate.getYear(), 2024)
        })

        it('Month should be 10', () => {
            assert.equal(simpleDate.getMonth(), 10)
        })

        it('Day of month should be 15', () => {
            assert.equal(simpleDate.getDayOfMonth(), 15)
        })

        it('should return Tue, Oct 15', () => {
            const localeDateString = simpleDate.toJsDate().toLocaleDateString('en-us', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                timeZone: 'America/Los_Angeles'
            })

            assert.equal(localeDateString, 'Tue, Oct 15')
        })
    })

    describe('#addDays', () => {

        it('Add 1 day', () => {
            assert.deepStrictEqual(new SimpleDate('2020-01-10').addDays(1).getRaw(), '2020-01-11')
        })

        it('Add 1 day to January 30', () => {
            assert.deepStrictEqual(new SimpleDate('2020-01-30').addDays(1).getRaw(), '2020-01-31')
        })

        it('Add 1 day, February 28, leap year', () => {
            assert.deepStrictEqual(new SimpleDate('2020-02-28').addDays(1).getRaw(), '2020-02-29')
        })

        it('Add 1 day with month overflow, January 31', () => {
            assert.deepStrictEqual(new SimpleDate('2020-01-31').addDays(1).getRaw(), '2020-02-01')
        })

        it('Add 1 day with month overflow, April 30', () => {
            assert.deepStrictEqual(new SimpleDate('2020-04-30').addDays(1).getRaw(), '2020-05-01')
        })

        it('Add 1 day with month overflow in February, non-leap year', () => {
            assert.deepStrictEqual(new SimpleDate('2021-02-28').addDays(1).getRaw(), '2021-03-01')
        })

        it('Add 1 day with month overflow in February, leap year', () => {
            assert.deepStrictEqual(new SimpleDate('2020-02-29').addDays(1).getRaw(), '2020-03-01')
        })

        it('Add 1 day with month and year overflow', () => {
            assert.deepStrictEqual(new SimpleDate('2019-12-31').addDays(1).getRaw(), '2020-01-01')
        })

        it('Subtract 1 day', () => {
            assert.deepStrictEqual(new SimpleDate('2020-01-10').addDays(-1).getRaw(), '2020-01-09')
        })

        it('Subtract 1 day with month overflow, February 1', () => {
            assert.deepStrictEqual(new SimpleDate('2020-02-01').addDays(-1).getRaw(), '2020-01-31')
        })

        it('Subtract 1 day, March 1, non-leap year', () => {
            assert.deepStrictEqual(new SimpleDate('2021-03-01').addDays(-1).getRaw(), '2021-02-28')
        })

        it('Subtract 1 day, March 1, leap year', () => {
            assert.deepStrictEqual(new SimpleDate('2020-03-01').addDays(-1).getRaw(), '2020-02-29')
        })

        it('Subtract 1 day with month overflow, May 1', () => {
            assert.deepStrictEqual(new SimpleDate('2020-05-01').addDays(-1).getRaw(), '2020-04-30')
        })

        it('Subtract 1 day with month and year overflow', () => {
            assert.deepStrictEqual(new SimpleDate('2020-01-01').addDays(-1).getRaw(), '2019-12-31')
        })
    })

    describe('#getIsoDate()', function () {
        it('getIsoDate should return correct ISO 8601 date', () => {
            let actual = new SimpleDate("2023-02-11").getIsoDate()
            assert.equal(actual, "2023-02-11T00:00:00.000")
        })
    })

    describe('#toJsDate()', function () {
        it('toJsDate should return correct Date object', () => {
            const actual = new SimpleDate("2023-02-11").toJsDate()
            assert.equal(typeof actual, "object")

            const timestamp = new Date(2023, 1, 11, 0, 0, 0, 0).getTime()
            assert.equal(actual.getTime(), timestamp)
        })
    })

    describe('#getDayOfWeek()', function () {
        it('getDayOfWeek should return 0 for new SimpleDate("2024-10-20")', () => {
            assert.equal(new SimpleDate("2024-10-20").getDayOfWeek(), 0)
        })

        it('getDayOfWeek should return 1 for new SimpleDate("2024-10-21")', () => {
            assert.equal(new SimpleDate("2024-10-21").getDayOfWeek(), 1)
        })
        it('getDayOfWeek should return 6 for new SimpleDate("2024-10-26")', () => {
            assert.equal(new SimpleDate("2024-10-26").getDayOfWeek(), 6)
        })
    })

    describe('#getDayNameInEnglish()', function () {
        it('getDayNameInEnglish should return Sunday for new SimpleDate("2024-10-20")', () => {
            assert.equal(new SimpleDate("2024-10-20").getDayNameInEnglish(), 'Sunday')
        })

        it('getDayNameInEnglish should return Monday for new SimpleDate("2024-10-21")', () => {
            assert.equal(new SimpleDate("2024-10-21").getDayNameInEnglish(), 'Monday')
        })

        it('getDayNameInEnglish should return Tuesday for new SimpleDate("2024-10-22")', () => {
            assert.equal(new SimpleDate("2024-10-22").getDayNameInEnglish(), 'Tuesday')
        })

        it('getDayNameInEnglish should return Wednesday for new SimpleDate("2024-10-23")', () => {
            assert.equal(new SimpleDate("2024-10-23").getDayNameInEnglish(), 'Wednesday')
        })

        it('getDayNameInEnglish should return Thursday for new SimpleDate("2024-10-24")', () => {
            assert.equal(new SimpleDate("2024-10-24").getDayNameInEnglish(), 'Thursday')
        })

        it('getDayNameInEnglish should return Friday for new SimpleDate("2024-10-25")', () => {
            assert.equal(new SimpleDate("2024-10-25").getDayNameInEnglish(), 'Friday')
        })

        it('getDayNameInEnglish should return Saturday for new SimpleDate("2024-10-26")', () => {
            assert.equal(new SimpleDate("2024-10-26").getDayNameInEnglish(), 'Saturday')
        })
    })

    describe('#today()', () => {
        it('today().isToday() should always be true (except super rare cases when the test is running at the time 23:59:59.999)', () => {
            assert.equal(SimpleDate.today().isToday(), true)
        })
    })

    describe('#isBetweenInclusive', () => {
        it('isBetweenInclusive() returns true', () => {
            assert.equal(new SimpleDate('2023-02-01').isBetweenInclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-03-01')
            ), true)
        })
        it('isBetweenInclusive() returns false because this is before the interval', () => {
            assert.equal(new SimpleDate('2023-01-01').isBetweenInclusive(
                new SimpleDate('2023-02-01'),
                new SimpleDate('2023-03-01')
            ), false)
        })
        it('isBetweenInclusive() returns true because this is on the left edge of the interval', () => {
            assert.equal(new SimpleDate('2023-01-01').isBetweenInclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), true)
        })
        it('isBetweenInclusive() returns false because this is after the interval', () => {
            assert.equal(new SimpleDate('2023-03-01').isBetweenInclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), false)
        })
        it('isBetweenInclusive() returns true because this is on the right edge of the interval', () => {
            assert.equal(new SimpleDate('2023-02-01').isBetweenInclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), true)
        })
    })

    describe('#isBetweenExclusive', () => {
        it('isBetweenExclusive() returns true', () => {
            assert.equal(new SimpleDate('2023-02-01').isBetweenExclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-03-01')
            ), true)
        })
        it('isBetweenExclusive() returns false because this is before the interval', () => {
            assert.equal(new SimpleDate('2023-01-01').isBetweenExclusive(
                new SimpleDate('2023-02-01'),
                new SimpleDate('2023-03-01')
            ), false)
        })
        it('isBetweenExclusive() returns false because this is on the left edge of the interval', () => {
            assert.equal(new SimpleDate('2023-01-01').isBetweenExclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), false)
        })
        it('isBetweenExclusive() returns false because this is after the interval', () => {
            assert.equal(new SimpleDate('2023-03-01').isBetweenExclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), false)
        })
        it('isBetweenExclusive() returns true because this is on the right edge of the interval', () => {
            assert.equal(new SimpleDate('2023-02-01').isBetweenExclusive(
                new SimpleDate('2023-01-01'),
                new SimpleDate('2023-02-01')
            ), false)
        })
    })

    describe('#daysBetween', () => {
        it("new SimpleDate('2023-01-01').daysBetween(new SimpleDate('2023-01-02')) should return 1", () => {
            assert.equal(new SimpleDate('2023-01-01').daysBetween(new SimpleDate('2023-01-02')), 1)
        })
        it("new SimpleDate('2023-01-02').daysBetween(new SimpleDate('2023-01-01')) should return -1", () => {
            assert.equal(new SimpleDate('2023-01-02').daysBetween(new SimpleDate('2023-01-01')), -1)
        })
        it("new SimpleDate('2023-01-01').daysBetween(new SimpleDate('2023-01-11')) should return 10", () => {
            assert.equal(new SimpleDate('2023-01-01').daysBetween(new SimpleDate('2023-01-11')), 10)
        })
        it("new SimpleDate('2023-02-28').daysBetween(new SimpleDate('2023-02-01')) should return 1", () => {
            assert.equal(new SimpleDate('2023-02-28').daysBetween(new SimpleDate('2023-03-01')), 1)
        })
        it("new SimpleDate('2024-02-28').daysBetween(new SimpleDate('2024-02-01')) should return 2", () => {
            assert.equal(new SimpleDate('2024-02-28').daysBetween(new SimpleDate('2024-03-01')), 2)
        })
    })

    describe('#getComponents', () => {
        it("SimpleDate('2023-02-01').getComponents() should return {year: 2023, month: 2, day: 1}", () => {
            assert.deepEqual(new SimpleDate('2023-02-01').getComponents(), {year: 2023, month: 2, day: 1})
        })
    })

    describe('#firstDayOfWeek', () => {
        it("SimpleDate('2023-02-20').firstDayOfWeek(WeekStartDay.MONDAY).getRaw() should return '2024-10-07'", () => {
            assert.equal(new SimpleDate('2024-10-07').firstDayOfWeek(WeekStartDay.MONDAY).getRaw(), '2024-10-07')
        })
        it("SimpleDate('2024-10-07').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw() should return '2024-10-06'", () => {
            assert.equal(new SimpleDate('2024-10-07').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw(), '2024-10-06')
        })
        it("SimpleDate('2024-10-07').firstDayOfWeek(WeekStartDay.MONDAY).getRaw() should return '2024-10-07'", () => {
            assert.equal(new SimpleDate('2024-10-07').firstDayOfWeek(WeekStartDay.MONDAY).getRaw(), '2024-10-07')
        })
        it("SimpleDate('2024-10-10').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw() should return '2024-10-06'", () => {
            assert.equal(new SimpleDate('2024-10-10').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw(), '2024-10-06')
        })
        it("SimpleDate('2024-10-20').firstDayOfWeek(WeekStartDay.MONDAY).getRaw() should return '2024-10-14'", () => {
            assert.equal(new SimpleDate('2024-10-20').firstDayOfWeek(WeekStartDay.MONDAY).getRaw(), '2024-10-14')
        })
        it("SimpleDate('2024-10-20').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw() should return '2024-10-20'", () => {
            assert.equal(new SimpleDate('2024-10-20').firstDayOfWeek(WeekStartDay.SUNDAY).getRaw(), '2024-10-20')
        })
    })

})
