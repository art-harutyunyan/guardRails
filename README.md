# GuardRails

This is the repository with the automated tests on the following scenarios:
==========================================================================
1) Login with your user, add 1 item to the basket, click on checkout, add a new address, fill in the address form, click on submit.
2) Exact same flow, but this time, add two items to your basket, click on checkout, add a new address, fill in the address form, click on submit.
3) Click on the search button, search for apple, verify that 2 apple products show up and that banana product doesn't show up

## Getting Started

These instructions will let you to run the tests on your machine

### Prerequisites

`npm` should be installed.
`node` v16.10.0 should be installed
The automated test files are created on latest Cypress version `11.0.1`

### Installing and Running

1) once cloned the repository run `npm install`
2) once the dependencies are installed 
    a) to tun integration tests run `npm run integration`
    b) to run cypress tests run `npm run cypress`
    c) to run all tests run `npm run all`

