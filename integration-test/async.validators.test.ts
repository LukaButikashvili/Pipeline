import { StdoutReporter, asyncValidate, checkAsync } from '../src'
import { wait } from './utils/wait'

const asyncValidators = [
	checkAsync({
		callback: async (value: number) => {
			await wait(100)

			if (value > 1) {
				return
			}

			throw new Error('Value should be greater than 1')
		},
	}),
	checkAsync({
		callback: async (value: number) => {
			if (value > 3) {
				return
			}

			throw new Error('Value should be greater than 3')
		},
	}),
]

describe('Async Validators', () => {
	describe('checkAsync', () => {
		it('Happy Path', () => {
			const value = 4

			const result = asyncValidate(value, asyncValidators)

			expect(result).resolves.toEqual([
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

		it('Error Path', () => {
			const value = 0

			const result = asyncValidate(value, asyncValidators)

			expect(result).resolves.toEqual([
				{
					isValid: false,
					message: 'Value should be greater than 1',
				},
				{
					isValid: false,
					message: 'Value should be greater than 3',
				},
			])
		})

		it('Partial Error', () => {
			const value = 2

			const result = asyncValidate(value, asyncValidators)

			expect(result).resolves.toEqual([
				{
					isValid: true,
					message: null,
				},
				{
					isValid: false,
					message: 'Value should be greater than 3',
				},
			])
		})

		it('Timeout', () => {
			const validators = [
				checkAsync({
					callback: async () => {
						await wait(2000)
					},
					timeout: 1000,
				}),
			]

			const result = asyncValidate(null, validators)

			expect(result).resolves.toEqual([
				{
					isValid: false,
					message: 'Timeout',
				},
			])
		})
	})

	describe('Should work with Reporter', () => {
		it('Happy path', async () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 4

			const result = await asyncValidate(value, asyncValidators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(true)
			expect(report.pickValid()).toEqual(result)

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith('[#1][ valid ] | null')
		})

		it('Error Path', async () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 0

			const result = await asyncValidate(value, asyncValidators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual([
				{
					isValid: false,
					message: 'Value should be greater than 1',
				},
				{
					isValid: false,
					message: 'Value should be greater than 3',
				},
			])

			report.report()
			expect(console.log).toBeCalledWith(
				'[#0][ invalid ] | Value should be greater than 1',
			)
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Value should be greater than 3',
			)
		})

		it('Partial Error', async () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const value = 2

			const result = await asyncValidate(value, asyncValidators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual([
				{
					isValid: false,
					message: 'Value should be greater than 3',
				},
			])

			report.report()
			expect(console.log).toBeCalledWith('[#0][ valid ] | null')
			expect(console.log).toBeCalledWith(
				'[#1][ invalid ] | Value should be greater than 3',
			)
		})

		it('Timeout', async () => {
			jest.spyOn(console, 'log').mockImplementation(() => {})
			const validators = [
				checkAsync({
					callback: async () => {
						await wait(2000)
					},
					timeout: 1000,
				}),
			]

			const result = await asyncValidate(null, validators)
			const report = new StdoutReporter(result)

			expect(report.isValid()).toBe(false)
			expect(report.pickInvalid()).toEqual([
				{
					isValid: false,
					message: 'Timeout',
				},
			])

			report.report()
			expect(console.log).toBeCalledWith('[#0][ invalid ] | Timeout')
		})
	})
})
