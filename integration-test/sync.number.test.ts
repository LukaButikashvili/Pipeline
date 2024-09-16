import {
	StdoutReporter,
	checkNumberValue,
	checkType,
	syncValidate,
} from '../src'

const validators = [
	checkType({ targetType: 'number' }),
	checkNumberValue({ min: 1, max: 10 }),
]

describe('syncValidate', () => {
	describe('checkNumberValue', () => {
		it('Value is a valid number', () => {
			const value = 1

			const result = syncValidate(value, validators)

			expect(result).toEqual([
				{
					isValid: true,
					message: null,
				},
				{
					isValid: true,
					message: null,
				},
			])
		})

		it('Value is an invalid number', () => {
			const value = 0

			const result = syncValidate(value, validators)

			expect(result).toEqual([
				{
					isValid: true,
					message: null,
				},
				{
					isValid: false,
					message: 'Value should be between 1 and 10',
				},
			])
		})

		it('Value is not a number', () => {
			const value = '1'

			const result = syncValidate(value, validators)

			expect(result).toEqual([
				{
					isValid: false,
					message: 'Value is not a number',
				},
				{
					isValid: false,
					message: 'Value is not a number',
				},
			])
		})
	})

	describe('Should work with Reporter', () => {
		it('Value is a valid number', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 1

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(true)
			expect(report.pickValid()).toEqual(result)

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith('[#1][ valid ] | null')
		})

		it('Value is an invalid number', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 0

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual([
				{
					isValid: false,
					message: 'Value should be between 1 and 10',
				},
			])

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Value should be between 1 and 10',
			)
		})

		it('Value is not a number', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = '1'

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual(result)

			report.report()
			expect(console.log).toBeCalledWith(
				'[#0][ invalid ] | Value is not a number',
			)
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Value is not a number',
			)
		})
	})
})
