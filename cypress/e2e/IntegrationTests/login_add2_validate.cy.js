describe('Login, add one item, and validate', () => {

    before( function() {
        
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
            cy.wrap(token).as('token')
            cy.wrap(bid).as('bid');
        });
    });

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
        
        // getting all available items
        cy.request({
            url: Cypress.env('search')
        }).then(res => {
            expect(res.status).to.eq(200)
            const items = res.body.data;
            // adding 2 random items to the basket
            for(let i = 0; i < 2; i++) {
                let a = Math.floor(Math.random()*res.body.data.length)
                cy.request({
                    method: 'POST',
                    url: Cypress.env('basketItems'),
                    body: {
                        "ProductId": items[a].id,
                        "BasketId": this.bid,
                        "quantity": 1
                    },
                    headers: {
                        authorization: `Bearer ${this.token}`
                    }
                }).then(res => {
                    expect(res.status).to.eq(200)
                })
            }
        });
    });

    it('Validate only one item in the basket and clear it', function() {
        // taking the all items in the basket 
        cy.request({
            method: 'GET',
            url: `${Cypress.env('basket') + this.bid}`,
            headers: {
                authorization: `Bearer ${this.token}`
            }
        }).then(res => {
            
            expect(res.status).to.eq(200);
            // expecting the items count to be 2
            expect(res.body.data.Products.length).to.eq(2)
        });
    });
});