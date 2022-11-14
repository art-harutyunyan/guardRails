describe('Login, add one item, and validate', () => {

    before( function() {
        
        //loging in before the tests
        cy.request({
            method: 'POST',
            url: Cypress.env('login'),
            body: {
                "email": Cypress.env('email'),
                "password": Cypress.env('password'),
            }
        }).then(res => {

            expect(res.status).to.eq(200);
            const token = res.body.authentication.token;
            const bid = res.body.authentication.bid;
            // aliasing the token and basketID to use in the tests
            cy.wrap(token).as('token')
            cy.wrap(bid).as('bid');
        });
    })
    
    //clearing the basket after the tests
    after( function() {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('basket') + this.bid}`,
            headers: {
                authorization: `Bearer ${this.token}`
            }
        }).then(res => {
            // cleaning the basket for the next tests
            res.body.data.Products.forEach(item => {

                cy.request({
                    method: 'DELETE',
                    url: `${Cypress.env('basketItems')+item.BasketItem.id}`,
                    headers: {
                        authorization: `Bearer ${this.token}`
                    }                
                });
            });
        });
    });
    it('Get all available items', function() {
        
        // taking the all available items
        cy.request({
            url: Cypress.env('search')
        }).then(res => {
            expect(res.status).to.eq(200)
            const items = res.body.data;
            const a = Math.floor(Math.random()*res.body.data.length)
            // aliasing a single random item id
            cy.wrap(items[a].id).as('items')
        });
    });

    it('Add one item', function() {
        
        // posting an item to basket
        cy.request({
            method: 'POST',
            url: Cypress.env('basketItems'),
            body: {
                "ProductId": this.items,
                "BasketId": this.bid,
                "quantity": 1
            },
            headers: {
                authorization: `Bearer ${this.token}`
            }
        }).then(res => {
            expect(res.status).to.eq(200)
        });
    });

    it('Validate only one item in the basket and clear it', function() {
        
        // getting the items in the basket
        cy.request({
            method: 'GET',
            url: `${Cypress.env('basket') + this.bid}`,
            headers: {
                authorization: `Bearer ${this.token}`
            }
        }).then(res => {
            
            expect(res.status).to.eq(200);
            expect(res.body.data.Products.length).to.eq(1)
        });
    });
});