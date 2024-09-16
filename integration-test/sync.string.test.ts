import {
	StdoutReporter,
	checkStringLength,
	checkType,
	syncValidate,
} from '../src'

const validators = [
	checkType({ targetType: 'string' }),
	checkStringLength({ min: 1, max: 10 }),
]

describe('syncValidate', () => {
	describe('String Values', () => {
		it('Value is a valid string', () => {
			const value = 'some str'

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

		it('Value is an invalid string', () => {
			const value = ''

			const result = syncValidate(value, validators)

			expect(result).toEqual([
				{
					isValid: true,
					message: null,
				},
				{
					isValid: false,
					message: 'Length should be between 1 and 10',
				},
			])
		})

		it('Value is not a string', () => {
			const value = [] as const

			const result = syncValidate(value, validators)

			expect(result).toEqual([
				{
					isValid: false,
					message: 'Value is not a string',
				},
				{
					isValid: false,
					message: 'Value is not a string',
				},
			])
		})
	})

	describe('Should work with Reporter', () => {
		it('Value is a valid string', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = '1'

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(true)
			expect(report.pickValid()).toEqual(result)

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith('[#1][ valid ] | null')
		})

		it('Value is an invalid string', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 'some long string'

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual([
				{
					isValid: false,
					message: 'Length should be between 1 and 10',
				},
			])

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Length should be between 1 and 10',
			)
		})

		it('Value is not a string', () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = [{}]

			const result = syncValidate(value, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual(result)

			report.report()
			expect(console.log).toBeCalledWith(
				'[#0][ invalid ] | Value is not a string',
			)
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Value is not a string',
			)
		})
	})
})
