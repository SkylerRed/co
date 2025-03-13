import { isFunction, isGenerator, isPromise } from './assert';
import { slice, toPromise } from './utils';

interface ReturnGenerator<This, T, TReturn, TNext> extends CallableFunction {
	(this: This, ...args: any[]): Generator<T, TReturn, TNext>;
}

function co<This = unknown, T = unknown, TReturn = any, TNext = any>(
	this: This,
	gen: Generator<T, TReturn, TNext> | ReturnGenerator<This, T, TReturn, TNext>,
) {
	const _this = this;
	const args = slice.call(arguments, 1);

	// we wrap everything in a promise to avoid promise chaining,
	// which leads to memory leak errors.
	// see https://github.com/tj/co/issues/180
	return new Promise(function (resolve, reject) {
		let generator: Generator | null = isGenerator(gen) ? gen : null;

		if (isFunction(gen)) {
			generator = gen.apply<This, Array<any>, Generator<T, TReturn, TNext>>(_this, args);
		}

		if (!generator || !isGenerator(generator)) {
			return resolve(generator);
		}

		onFulfilled();

		function onFulfilled(resp?: any) {
			let result;
			try {
				result = (<Generator>generator).next(resp);
			} catch (e) {
				return reject(e);
			}
			next(result);
			return null;
		}

		/**
		 * @param {Error} err
		 * @return {Promise}
		 * @api private
		 */

		function onRejected(err: Error) {
			let result;
			try {
				result = (<Generator>generator).throw(err);
			} catch (e) {
				return reject(e);
			}
			next(result);
		}

		/**
		 * Get the next value in the generator,
		 * return a promise.
		 *
		 * @param {Object} result
		 * @return {Promise}
		 * @api private
		 */

		function next(result) {
			if (result.done) {
				return resolve(result.value);
			}

			const value = toPromise.call(_this, result.value);
			if (value && isPromise(value)) {
				return value.then(onFulfilled, onRejected);
			}

			const error = new TypeError('You may only yield a function, promise, generator, array, or object, '
				+ 'but the following object was passed: "' + String(result.value) + '"');

			return onRejected(error);
		}
	});
}

export { co };
export default co;
