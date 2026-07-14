import type { SmartDetectionResult } from '../../features/smart-detection/detect';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '../../i18n';
import { SmartDetectionPanel, type SmartDetector } from './SmartDetectionPanel';

const detected: SmartDetectionResult = {
  candidates: [
    {
      confidence: 91,
      itemCount: 6,
      reasons: ['repeated_siblings', 'shared_class', 'meaningful_text', 'links'],
      selector: 'article.workshop-card',
      suggestedFields: [
        { mode: 'text', name: 'title', selector: 'h2' },
        { mode: 'href', name: 'url', selector: 'a' },
      ],
    },
  ],
  execution: 'worker',
  inspectedNodes: 42,
  snapshotTruncated: false,
};

describe('smart detection panel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('shows candidates and converts a selected suggestion into a custom recipe', async () => {
    const user = userEvent.setup();
    const onUse = vi.fn();
    const detect: SmartDetector = vi.fn().mockResolvedValue(detected);
    render(
      <SmartDetectionPanel
        detect={detect}
        finalUrl="https://example.com/workshops"
        html="<main />"
        onUse={onUse}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Repeated structure detected' }),
    ).toBeInTheDocument();
    expect(screen.getByText('6 similar items found')).toBeInTheDocument();
    expect(screen.getByText('article.workshop-card')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('91% confidence')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use this suggestion' }));

    expect(onUse).toHaveBeenCalledWith({
      fields: [
        expect.objectContaining({ mode: 'text', name: 'title', selector: 'h2' }),
        expect.objectContaining({ mode: 'href', name: 'url', selector: 'a' }),
      ],
      itemSelector: 'article.workshop-card',
    });
  });

  it('keeps the rest of the workspace usable after a strict timeout', async () => {
    const detect: SmartDetector = vi.fn().mockResolvedValue({
      candidates: [],
      execution: 'fallback',
      fallbackReason: 'timeout',
      inspectedNodes: 2_500,
      snapshotTruncated: true,
    });
    render(
      <SmartDetectionPanel
        detect={detect}
        finalUrl="https://example.com"
        html="<main />"
        onUse={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Pattern analysis reached its time limit' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry pattern analysis' })).toBeInTheDocument();
  });
});
