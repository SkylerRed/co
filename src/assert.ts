function isArray<T = any>(obj): obj is Array<T> {
	return Array.isArray(obj);
}

function isFunction(obj): obj is Function {
	return typeof obj === 'function';
}

function isGenerator<T = unknown, TReturn = any, TNext = any>(obj): obj is Generator<T, TReturn, TNext> {
	return isFunction(obj.next) && isFunction(obj.throw);
}

function isGeneratorFunction(obj): obj is GeneratorFunction {
	const constructor = obj.constructor;
	if (!constructor) return false;
	if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true;
	return isGenerator(constructor.prototype);
}

function isObject(val) {
	return Object === val.constructor;
}

function isPromise<T = any>(obj): obj is Promise<T> {
	return isFunction(obj.then);
}

export {
	isArray,
	isFunction,
	isGenerator,
	isGeneratorFunction,
	isObject,
	isPromise,
};
