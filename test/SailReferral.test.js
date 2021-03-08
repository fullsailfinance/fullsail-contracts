const { expectRevert } = require('@openzeppelin/test-helpers');
const { assert } = require("chai");

const SailToken = artifacts.require('SailToken');
const SailReferral = artifacts.require('SailReferral');

contract('SailReferral', ([alice, bob, carol, referrer, operator, owner]) => {
    beforeEach(async () => {
        this.sailToken = await SailToken.new({ from: owner });
        this.sailReferral = await SailReferral.new({ from: owner });
        this.zeroAddress = '0x0000000000000000000000000000000000000000';
    });

    it('should allow operator and only owner to update operator', async () => {
        assert.equal((await this.sailReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.sailReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');

        await expectRevert(this.sailReferral.updateOperator(operator, true, { from: carol }), 'Ownable: caller is not the owner');
        await this.sailReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.sailReferral.operators(operator)).valueOf(), true);

        await this.sailReferral.updateOperator(operator, false, { from: owner });
        assert.equal((await this.sailReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.sailReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');
    });

    it('record referral', async () => {
        assert.equal((await this.sailReferral.operators(operator)).valueOf(), false);
        await this.sailReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.sailReferral.operators(operator)).valueOf(), true);

        await this.sailReferral.recordReferral(this.zeroAddress, referrer, { from: operator });
        await this.sailReferral.recordReferral(alice, this.zeroAddress, { from: operator });
        await this.sailReferral.recordReferral(this.zeroAddress, this.zeroAddress, { from: operator });
        await this.sailReferral.recordReferral(alice, alice, { from: operator });
        assert.equal((await this.sailReferral.getReferrer(alice)).valueOf(), this.zeroAddress);
        assert.equal((await this.sailReferral.referralsCount(referrer)).valueOf(), '0');

        await this.sailReferral.recordReferral(alice, referrer, { from: operator });
        assert.equal((await this.sailReferral.getReferrer(alice)).valueOf(), referrer);
        assert.equal((await this.sailReferral.referralsCount(referrer)).valueOf(), '1');

        assert.equal((await this.sailReferral.referralsCount(bob)).valueOf(), '0');
        await this.sailReferral.recordReferral(alice, bob, { from: operator });
        assert.equal((await this.sailReferral.referralsCount(bob)).valueOf(), '0');
        assert.equal((await this.sailReferral.getReferrer(alice)).valueOf(), referrer);

        await this.sailReferral.recordReferral(carol, referrer, { from: operator });
        assert.equal((await this.sailReferral.getReferrer(carol)).valueOf(), referrer);
        assert.equal((await this.sailReferral.referralsCount(referrer)).valueOf(), '2');
    });
});
