// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import addr from '../fixtures/addresses.json'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('closeWelcomePopup', () => {
    
    cy.get('div[class="cdk-overlay-container bluegrey-lightgreen-theme"]').then(() => {

        if(Cypress.$('#mat-dialog-0').length > 0) {
            cy.get('[aria-label="Close Welcome Banner"]').click();
        }
    });
});

// close the cookie popup
Cypress.Commands.add('closeMeWantItPopup', () => {

    cy.get('div[role="dialog"]').then(($element) => {
        if($element.is(':visible')) {
            cy.get('a[class="cc-btn cc-dismiss"]').click();
        }
    });
});

// login function with given username/pass
Cypress.Commands.add('login', (email, password) => {

    cy.get('[aria-label="Show the shopping cart"]').should('not.exist')
    cy.intercept('POST', Cypress.env('login')).as('login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#loginButton').click();
    cy.wait('@login').its('response').then(data => {

        expect(data.statusCode).to.equal(200);
    });
    cy.url().should('contain', '/#/search')
    // confirming that the basket icon appaers after the login
    cy.get('[aria-label="Show the shopping cart"]').find('mat-icon')
        .should('exist')
        .and('be.visible')
        .siblings('span').eq(0)
        .should('have.text',  ' Your Basket');
});

// add items to basket with a given count
Cypress.Commands.add('addToBasket', (n) => {

    cy.request({
        method: 'GET',
        url: Cypress.env('search'),
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {
        
        // looping to add item/s to the basket
        // validating the splash message appearing on item add
        for(let i = 0; i < n; i++) {
            cy.get('div[class="mat-grid-tile-content"]').eq(i)
                .find('button')
                .should('be.visible')
                .click();
            cy.get('snack-bar-container')
                .should('be.visible')
                .find('span[class="mat-simple-snack-bar-content"]')
                .should('have.text', `Placed ${res.body.data[i].name} into basket.`);
            if(n > 1) {
                cy.wait(6000)
            }    
        }
        cy.get('snack-bar-container', {timeout: 6000}).should('not.exist');
    });
});

// this function validates the items count in basket
Cypress.Commands.add('validateItemsCountInBasket', () => {

    cy.request({
        method: 'GET',
        url: `${Cypress.env('basket') + sessionStorage.getItem('bid')}`,
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {
        
        //getting the sum of quantities from API response 
        let quantity = res.body.data.Products.reduce((aggr, val) => {
            return aggr + val.BasketItem.quantity
        }, 0);
        // validating the number is shown on the basket is the same as the sum of quantity
        cy.get('[aria-label="Show the shopping cart"]').find('span').eq(2)
            .should('have.text', quantity)                
    });
   
});

// this function adds a new address
Cypress.Commands.add('addNewAddress', () => {

    cy.get('[aria-label="Add a new address"]').click();
    cy.url().should('contain', '/#/address/create');
    
    // adding the predefined values to the corresponding fields
    Object.values(addr).forEach((val, index) => {
        cy.get('#address-form').find('.mat-form-field-wrapper').eq(index).type(val);
    });

    cy.get('#submitButton').click();
    cy.get('span[class="mat-simple-snack-bar-content"]').should('have.text', `The address at ${addr.city} has been successfully added to your addresses.`)
    cy.get('span[class="mat-simple-snack-bar-content"]', {timeout: 6000}).should('not.exist');

});

// function to clear the basket to keep the basket clean used in after hook
Cypress.Commands.add('clearBasket', () => {

    cy.request({
        method: 'GET',
        url: `${Cypress.env('basket') + sessionStorage.getItem('bid')}`,
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {
        
        // looping to remvoe the items from the basket
        res.body.data.Products.forEach(product => {
            
            cy.request({
                method: 'DELETE',
                url: `${Cypress.env('basketItems') + product.BasketItem.id}`,
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        });
    });
});

// searching for an item
Cypress.Commands.add('searchWithKeyword', (keyword) => {
    
    // getting all items from the API
    cy.request({
        method: 'GET',
        url: Cypress.env('search'),
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {

        // initial validation on the search-box functionality
        cy.get('mat-search-bar').click();
        cy.get('div[class="mat-form-field-infix ng-tns-c119-6"]')
            .find('input')
            .clear()
            .should('be.empty')
            .type('abc')
            .should('have.value', 'abc')
            .clear()
            .should('be.empty')
            .type(`${keyword}{enter}`)
            .wait(1000);
        
        // validating the search result row
        cy.get('div[class="ng-star-inserted"]')
            .find('span').eq(0)
            .should('have.text', 'Search Results - ')
            .siblings('span')
            .should('have.text', keyword);

        // filtering the items which match the condition
        let searchItems = res.body.data.filter((item) => {
            
            if( item.name.toLowerCase().includes(keyword.toLowerCase()) 
                || item.description.toLowerCase().includes(keyword.toLowerCase())) {
                return item
            } 
        });

        // if the array of items is not empty
        if(searchItems.length > 0) {
            
            cy.get('div[class="mat-grid-tile-content"]').should('have.length', searchItems.length);
            cy.get('div[class="mat-grid-tile-content"]')
                .find('div[class="item-name"]').then(itemName => {
                    expect(itemName.text().toLowerCase()).to.contain(keyword.toLowerCase());
                });
        }
        // if there is no item found to match the keyword
        else {
            cy.get('app-search-result')
                .find('mat-card-title')
                .find('span')
                .should('have.text', ' No results found ')
            cy.get('mat-card').find('img')
                .should('have.attr', 'src', "assets/public/images/products/no-results.png");
            cy.get('mat-card-content')
                    .find('span')
                    .should('have.text', " Try adjusting your search to find what you're looking for. ");
        }
        
        cy.get('mat-search-bar').click();
    });
});