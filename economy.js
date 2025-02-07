class Economy {
    constructor(startingMoney = 200) {
        this.money = startingMoney;
        this.moneyDisplay = document.getElementById('money-display');

        if (!this.moneyDisplay) {
            console.error("Money display element not found.");
            window.addEventListener('DOMContentLoaded', () => {
                this.moneyDisplay = document.getElementById("money-display");
                if (this.moneyDisplay) {
                    this.updateUI();
                } else {
                    console.error("Critical ERROR: #money-display still not found!");
                }
            })
            return;
        }

        this.updateUI();
    }

    updateUI() {
        if (this.moneyDisplay) {
            this.moneyDisplay.innerText = `Money: $${this.money}`;
        } else {
            console.error("Money display is null when trying to update.");
        }

    }

    earn(amount) {
        this.money += amount;
        this.updateUI();
    }

    spend(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateUI();
            return true;
        } else {
            return false;
        }
    }
}