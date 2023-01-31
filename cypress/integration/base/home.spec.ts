/// <reference types="cypress" />

describe('The Home Page', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('displays the header with the links and the lending page', () => {
        cy.get('[data-cy="header"]').should('be.visible');
        cy.get('[data-cy="lending"]').should('be.visible');
        cy.get('[data-cy="terminal"]').should('be.visible');
        cy.get('[data-cy="history"]').should('be.visible');
        cy.get('[data-cy="wallet"]').should('be.visible');
        cy.get('[data-testid="lending-page"]').should('be.visible');
    });

    it('can follow links on header buttons', () => {
        cy.get('[data-cy="terminal"]').click();
        cy.url().should('include', '/exchange');
        cy.get('[data-testid="exchange-page"]').should('be.visible');

        cy.get('[data-cy="lending"]').click();
        cy.get('[data-testid="lending-page"]').should('be.visible');
    });

    it('display two wallet providers when clicking unlocking wallet', () => {
        cy.get('[data-cy="wallet"]').click();
        cy.get('[data-cy="modal"]').should('be.visible');
        cy.get('[data-cy="radio-group"]').should('be.visible');

        cy.get('[data-cy="radio-group"]')
            .children()
            .should('have.length', 2)
            .and(radioList => {
                chai.expect(
                    radioList.get(0).textContent,
                    'Metamask button'
                ).to.be.equal('Metamask');
                chai.expect(
                    radioList.get(1).textContent,
                    'WalletConnect button'
                ).to.be.equal('WalletConnect');
            })
            .and(radioList => {
                radioList.get(0).click();
            });

        cy.get('[data-testid="dialog-action-button"]')
            .should('be.visible')
            .click();
    });
});
