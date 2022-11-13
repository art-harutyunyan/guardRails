describe('Login to website and add 2 item', () => {

    before( () => {
        cy.visit('/#/login');
        cy.wait(3000);
        cy.closeWelcomePopup();
        cy.closeMeWantItPopup();
        cy.login(Cypress.env('email'), Cypress.env('password'));
    });

    after( () => {
        // clearing the basket after each test
        cy.clearBasket();
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