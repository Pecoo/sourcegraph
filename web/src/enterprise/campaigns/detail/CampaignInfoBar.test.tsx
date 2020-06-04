import React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import { CampaignInfoBar } from './CampaignInfoBar'
import * as H from 'history'

describe('CampaignInfoBar', () => {
    test('', () =>
        expect(
            createRenderer().render(
                <CampaignInfoBar
                    campaign={{
                        author: { avatarURL: null, username: 'alice' },
                        createdAt: '2020-01-01',
                        description: '**a** b',
                    }}
                    history={H.createMemoryHistory()}
                />
            )
        ).toMatchSnapshot())
})
