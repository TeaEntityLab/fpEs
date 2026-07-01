import fpEs from '../index';

describe('index (package entry point)', function () {
	// The published `main`. Consumers do `require('fpes')` and reach everything
	// through this aggregator, so its wiring is part of the public contract.
	it('exposes the named modules', function () {
		fpEs.should.have.property('Maybe');
		fpEs.should.have.property('MonadIO');
		fpEs.should.have.property('Publisher');
		(typeof fpEs.Publisher).should.equal('function');
	});

	it('spreads the fp helpers onto the top level', function () {
		(typeof fpEs.curry).should.equal('function');
		(typeof fpEs.compose).should.equal('function');
		(typeof fpEs.pipe).should.equal('function');
		(typeof fpEs.map).should.equal('function');
		(typeof fpEs.reduce).should.equal('function');
	});

	it('spreads the pattern helpers onto the top level', function () {
		fpEs.should.have.property('TypeNumber');
		fpEs.should.have.property('TypeADT');
		fpEs.should.have.property('SumType');
		fpEs.should.have.property('ProductType');
		fpEs.should.have.property('PatternMatching');
	});

	// Both bug fixes must be reachable through the entry point, not just the
	// individual modules, since that is what consumers actually load.
	it('carries the None short-circuit fix through the entry point', function () {
		fpEs.Maybe.empty().map(x => x + 1).isNull().should.equal(true);
		fpEs.Maybe.of(1).map(x => x + 1).unwrap().should.equal(2);
	});

	it('carries the null-safety fix through the entry point', function () {
		fpEs.TypeNumber.matches(null).should.equal(false);
		(fpEs.TypeADT(null) === fpEs.TypeNull).should.equal(true);
	});

	// fp.js regressions must also be reachable via the published main entry.
	it('carries fp bug-fix regressions through the entry point', function () {
		JSON.stringify(fpEs.difference([1, 1, 2], [2, 3])).should.equal('[3]');
		JSON.stringify(fpEs.difference('aab', 'bc')).should.equal('["c"]');

		var src = [1, 2, 3, 4];
		JSON.stringify(fpEs.take(2, src)).should.equal('[1,2]');
		JSON.stringify(src).should.equal('[1,2,3,4]');
		JSON.stringify(fpEs.take(2, 'abcd')).should.equal('["a","b"]');

		JSON.stringify(fpEs.fill([5], 9)).should.equal('[9]');
		JSON.stringify(fpEs.intersection([2, 0], [2, 0])).should.equal('[2,0]');
	});
});
