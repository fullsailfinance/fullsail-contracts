const { expectRevert, time } = require('@openzeppelin/test-helpers');
const SailToken = artifacts.require('SailToken');
const MasterChef = artifacts.require('MasterChef');


contract('MasterChef', ([alice, minter]) => {
    beforeEach(async () => {
        this.sail = await SailToken.new({ from: minter });
        this.chef = await MasterChef.new(this.sail.address, '10', { from: minter });
    });
    it('update emission rate', async () => {
        assert.equal((await this.chef.startBlock()).valueOf(), '10');
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '1000000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '0');

        await time.advanceBlockTo('9'); // 9
        await expectRevert(this.chef.updateEmissionRate({ from: alice }), 'updateEmissionRate: Can only be called after mining starts'); // 10
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '1000000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '0');

        await time.advanceBlockTo('28'); // 28
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '1000000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '0');
        await this.chef.updateEmissionRate({ from: alice }); // 29
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '970000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '1');
        await this.chef.updateEmissionRate({ from: alice }); // 30

        await time.advanceBlockTo('105'); // 105
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '970000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '1');
        await this.chef.updateEmissionRate({ from: alice }); // 106
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '858734025700000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '5');
        await this.chef.updateEmissionRate({ from: alice }); // 107

        await time.advanceBlockTo('1434'); // 1434
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '858734025700000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '5');
        await this.chef.updateEmissionRate({ from: alice }); // 1435
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '101831014379039644');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '75');
        await this.chef.updateEmissionRate({ from: alice }); // 1436

        await time.advanceBlockTo('1472'); // 1472
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '101831014379039644');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '75');
        await this.chef.updateEmissionRate({ from: alice }); // 1473
        assert.equal((await this.chef.sailPerBlock()).valueOf(), '100000000000000000');
        assert.equal((await this.chef.lastReductionPeriodIndex()).valueOf(), '77');

        await expectRevert(this.chef.updateEmissionRate({ from: alice }), 'updateEmissionRate: Emission rate has reached the minimum threshold');
    });
});
