describe('Login to website and add an item', () => {

    beforeEach( () => {
        cy.visit('/#/login');
        cy.wait(3000);
        cy.closeWelcomePopup();
        cy.closeMeWantItPopup();
        cy.login(Cypress.env('email'), Cypress.env('password'));
    });

    afterEach( () => {
        // clearing the basket after each test
        cy.clearBasket();
    });

    it('Add one item to basket', () => {
        // adding 1 item to the basket
        cy.addToBasket(1);
        // comparing the basket items count with the API response
        cy.validateItemsCountInBasket();
        cy.get('[aria-label="Show the shopping cart"]').click();
        cy.get('mat-row').should('have.length', 1);
        cy.get('#checkoutButton').click();
        cy.addNewAddress();
    });

    it('Add two items to basket', () => {
        
        cy.addToBasket(2);
        cy.validateItemsCountInBasket();
        cy.get('[aria-label="Show the shopping cart"]').click();
        cy.get('mat-row').should('have.length', 2);
        cy.get('#checkoutButton').click();
        cy.addNewAddress();
    });
});

