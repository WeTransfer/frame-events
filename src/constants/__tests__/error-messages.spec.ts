import ERROR_MESSAGES from '../error-messages';

describe('Error messages', () => {
  it('should match snapshot', () => {
    expect(ERROR_MESSAGES).toMatchSnapshot();
  });
});
