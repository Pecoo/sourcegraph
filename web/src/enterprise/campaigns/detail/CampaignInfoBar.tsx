import React from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { Timestamp } from '../../../components/time/Timestamp'
import { CampaignStateBadge } from '../common/CampaignStateBadge'
import { Link } from 'react-router-dom'

interface Props {
    campaign: Pick<GQL.ICampaign, 'url' | 'createdAt' | 'closedAt' | 'viewerCanAdminister'> & {
        author: Pick<GQL.ICampaign['author'], 'username' | 'url'>
    }
    className?: string
}

export const CampaignInfoBar: React.FunctionComponent<Props> = ({ campaign, className = '' }) => (
    <div className={`d-flex align-items-center ${className}`}>
        <CampaignStateBadge campaign={campaign} className="mr-2" />
        <span>
            Opened <Timestamp date={campaign.createdAt} /> by{' '}
            <Link to={campaign.author.url}>
                <strong>{campaign.author.username}</strong>
            </Link>
        </span>
        <div className="flex-1" />
        {campaign.viewerCanAdminister && (
            <>
                <Link to={`${campaign.url}/edit`} className="btn btn-outline-primary mr-2">
                    Edit
                </Link>
                <Link to={`${campaign.url}/close`} className="btn btn-outline-warning">
                    Close
                </Link>
            </>
        )}
    </div>
)
