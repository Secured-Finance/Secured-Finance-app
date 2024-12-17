import { LinkList } from 'src/utils';

describe('links', () => {
    it('should have eight links', () => {
        expect(LinkList).toHaveLength(8);
    });
});
