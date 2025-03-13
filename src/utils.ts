import { isArray, isFunction, isGenerator, isGeneratorFunction, isObject, isPromise } from './assert';
import co from '.';

const slice = Array.prototype.slice;

function objectToPromise(obj) {
	const keys = Object.keys(obj);
	const results = new obj.constructor();
	const promises: Array<Promise<void>> = [];

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const promise = toPromise.call(this, obj[key]);

		if (promise && isPromise(promise)) {
			defer(promise, key);
		} else {
			results[key] = obj[key];
		}
	}

	return Promise.all(promises).then(function () {
		return results;
	});

	function defer(promise: Promise<void>, key) {
		// predefine the key in the result
		results[key] = undefined;
		promises.push(promise.then(function (res) {
			results[key] = res;
		}));
	}
}

function arrayToPromise(obj: any[]) {
	return Promise.all(obj.map(toPromise, this));
}

function thunkToPromise(fn) {
	const ctx = this;
	return new Promise(function (resolve, reject) {
		fn.call(ctx, function (err, res) {
			if (err) return reject(err);
			if (arguments.length > 2) res = slice.call(arguments, 1);
			resolve(res);
		});
	});
}

function toPromise(obj) {
	if (!obj) return obj;
	if (isPromise(obj)) return obj;
	if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
	if (isFunction(obj)) return thunkToPromise.call(this, obj);
	if (isArray(obj)) return arrayToPromise.call(this, obj);
	if (isObject(obj)) return objectToPromise.call(this, obj);
	return obj;
}

export {
	arrayToPromise,
	thunkToPromise,
	objectToPromise,
	toPromise,
	slice,
};
