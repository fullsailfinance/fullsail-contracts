const { assert } = require("chai");

const SailToken = artifacts.require('SailToken');

contract('SailToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.sail = await SailToken.new({ from: minter });
        this.burnAddress = '0x000000000000000000000000000000000000dEaD';
    });

    it('mint', async () => {
        await this.sail.mint(alice, 1000, { from: minter });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '1000');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '0');

        await this.sail.transfer(bob, 10, { from: alice });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '990');
        assert.equal((await this.sail.balanceOf(bob)).toString(), '10');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '0');

        await this.sail.transfer(bob, 100, { from: alice });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '890');
        assert.equal((await this.sail.balanceOf(bob)).toString(), '108');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '2');

        await this.sail.approve(carol, 10, { from: alice });
        await this.sail.transferFrom(alice, carol, 10, { from: carol });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '880');
        assert.equal((await this.sail.balanceOf(carol)).toString(), '10');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '2');

        await this.sail.approve(carol, 100, { from: alice });
        await this.sail.transferFrom(alice, carol, 100, { from: carol });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '780');
        assert.equal((await this.sail.balanceOf(carol)).toString(), '108');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '4');

        await this.sail.transfer(this.burnAddress, 1, { from: alice });
        assert.equal((await this.sail.balanceOf(alice)).toString(), '779');
        assert.equal((await this.sail.balanceOf(this.burnAddress)).toString(), '5');
    });
});
