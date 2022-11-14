describe('Search for the given item', () =>{

    beforeEach( () => {
        
        cy.visit('');
        cy.location('pathname').should('equal', '/');
        cy.wait(3000);
        cy.closeWelcomePopup();
        cy.closeMeWantItPopup();
    });

    it('Search an item with a keyword', () =>{

        cy.searchWithKeyword('apple');
        // validating that there is no banana in the found items
        cy.get('div[class="mat-grid-tile-content"]')
            .find('div[class="item-name"]').then(itemName => {
                
                expect(itemName.text().toLowerCase()).to.not.contain('banana');
            });
            cy.searchWithKeyword('something unavailable');
    });
    
        
});