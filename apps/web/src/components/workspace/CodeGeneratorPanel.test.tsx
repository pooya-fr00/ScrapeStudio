import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '../../i18n';
import { CodeGeneratorPanel } from './CodeGeneratorPanel';

const recipe = {
  itemSelector: '.product-card',
  fields: [{ id: 'title', mode: 'text' as const, name: 'title', selector: 'h2', trim: true }],
};

describe('code generator panel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('switches targets and copies generated code', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(
      <CodeGeneratorPanel
        recipe={recipe}
        targetUrl="https://example.com/catalog?api_token=private-value"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Starter code from this recipe' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sensitive-looking query values were not copied/)).toHaveTextContent(
      'api_token',
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('BeautifulSoup');

    await user.click(screen.getByRole('tab', { name: 'JavaScript / Node.js' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('parseHTML');
    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('AbortSignal.timeout'));
    expect(await screen.findByText('Code copied.')).toBeInTheDocument();
  });

  it('renders Persian copy while keeping technical code LTR', async () => {
    await i18n.changeLanguage('fa');
    render(<CodeGeneratorPanel recipe={recipe} targetUrl="https://example.com/catalog" />);

    expect(
      screen.getByRole('heading', { name: 'کد شروع بر پایهٔ همین دستور' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tabpanel').querySelector('pre')).toHaveAttribute('dir', 'ltr');
  });
});
