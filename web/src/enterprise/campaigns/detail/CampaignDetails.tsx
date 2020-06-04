import React, { useMemo, useCallback } from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { PageTitle } from '../../../components/PageTitle'
import { UserAvatar } from '../../../user/UserAvatar'
import { Timestamp } from '../../../components/time/Timestamp'
import {
    queryPatchesFromCampaign,
    queryPatchesFromPatchSet,
    queryChangesets,
    queryPatchFileDiffs,
    fetchPatchSetById,
} from './backend'
import * as H from 'history'
import { CampaignBurndownChart } from './BurndownChart'
import { AddChangesetForm } from './AddChangesetForm'
import { Subject, NEVER, Observable } from 'rxjs'
import { renderMarkdown } from '../../../../../shared/src/util/markdown'
import { Markdown } from '../../../../../shared/src/components/Markdown'
import { ThemeProps } from '../../../../../shared/src/theme'
import { CampaignStatus } from './CampaignStatus'
import { CampaignChangesets } from './changesets/CampaignChangesets'
import { CampaignDiffStat } from './CampaignDiffStat'
import { pluralize } from '../../../../../shared/src/util/strings'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { TelemetryProps } from '../../../../../shared/src/telemetry/telemetryService'
import { CampaignPatches } from './patches/CampaignPatches'
import { PatchSetPatches } from './patches/PatchSetPatches'
import { MinimalCampaign, MinimalPatchSet } from './CampaignArea'
import { useObservable } from '../../../../../shared/src/util/useObservable'
import { CampaignDescription } from './CampaignDescription'
import { CampaignInfoBar } from './CampaignInfoBar'
import { Timeline } from '../../../components/timeline/Timeline'
import { Link } from 'react-router-dom'

export type CampaignUIMode = 'viewing' | 'deleting' | 'closing'

interface Props extends ThemeProps, ExtensionsControllerProps, PlatformContextProps, TelemetryProps {
    campaign: MinimalCampaign
    history: H.History
    location: H.Location

    fetchPatchSetById: typeof fetchPatchSetById | ((patchSet: GQL.ID) => Observable<MinimalPatchSet | null>)
    queryPatchesFromCampaign: typeof queryPatchesFromCampaign
    queryPatchesFromPatchSet: typeof queryPatchesFromPatchSet
    queryPatchFileDiffs: typeof queryPatchFileDiffs
    queryChangesets: typeof queryChangesets
    _noSubject?: boolean
}

/**
 * The area for a single campaign.
 */
export const CampaignDetails: React.FunctionComponent<Props> = ({
    campaign,
    history,
    location,
    isLightTheme,
    extensionsController,
    platformContext,
    telemetryService,
    fetchPatchSetById,
    queryPatchesFromCampaign,
    queryPatchesFromPatchSet,
    queryPatchFileDiffs,
    queryChangesets,
}) => {
    /** Retrigger campaign fetching */
    const campaignUpdates = useMemo(() => new Subject<void>(), [])
    /** Retrigger changeset fetching */
    const changesetUpdates = useMemo(() => new Subject<void>(), [])

    const onAddChangeset = useCallback((): void => {
        // we also check the campaign.changesets.totalCount, so an update to the campaign is required as well
        campaignUpdates.next()
        changesetUpdates.next()
    }, [campaignUpdates, changesetUpdates])

    // TODO(sqs)
    const afterRetry = useCallback(() => {
        /* noop */
    }, [])

    const patchSet = useObservable(
        useMemo(() => (campaign.patchSet?.id ? fetchPatchSetById(campaign.patchSet.id) : NEVER), [
            campaign.patchSet,
            fetchPatchSetById,
        ])
    )

    const totalChangesetCount = campaign?.changesets.totalCount ?? 0

    const totalPatchCount = (campaign?.patches.totalCount ?? 0) + (patchSet?.patches.totalCount ?? 0)

    // TODO(sqs): add retry

    return (
        <>
            <PageTitle title={campaign.name} />
            <div className="container">
                <header>
                    <h1 className="mb-1">{campaign.name}</h1>
                    <CampaignInfoBar campaign={campaign} />
                </header>
                <Timeline className="mt-3">
                    <CampaignDescription campaign={campaign} history={history} className="w-100" />
                    <CampaignStatus campaign={campaign} afterRetry={afterRetry} history={history} className="mt-3" />
                    {totalChangesetCount > 0 && (
                        <div className="card mt-3 w-100 pr-4 pb-3">
                            <CampaignBurndownChart
                                changesetCountsOverTime={campaign.changesetCountsOverTime}
                                history={history}
                                className="card-body"
                            />
                        </div>
                    )}
                </Timeline>
            </div>
            <nav className="my-3 border-top border-bottom py-2">
                <div className="container d-flex align-items-center">
                    <h3 className="font-weight-bold mb-0">Changesets</h3>
                    <span>TODO(sqs) changeset filters go here</span>
                    <div className="flex-1" />
                    {campaign.viewerCanAdminister && (
                        <>
                            <Link to={`${campaign.url}/edit`} className="btn btn-outline-secondary mr-2">
                                Add existing changeset
                            </Link>
                            <Link to={`${campaign.url}/edit`} className="btn btn-outline-primary">
                                Upload new patches
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            <div className="container">
                {/* Only campaigns that have no patch set can add changesets manually. */}
                {!campaign.patchSet && campaign.viewerCanAdminister && !campaign.closedAt && (
                    <>
                        {totalChangesetCount === 0 && (
                            <div className="mt-4 mb-2 alert alert-info e2e-campaign-get-started">
                                Add a changeset to get started.
                            </div>
                        )}
                        <AddChangesetForm campaignID={campaign.id} onAdd={onAddChangeset} history={history} />
                    </>
                )}

                {totalChangesetCount + totalPatchCount > 0 && (
                    <>
                        <h3 className="mt-4 d-flex align-items-end mb-0">
                            {totalPatchCount > 0 && (
                                <>
                                    {totalPatchCount} {pluralize('Patch', totalPatchCount, 'Patches')}
                                </>
                            )}
                            {(totalChangesetCount > 0 || !!campaign) && totalPatchCount > 0 && (
                                <span className="mx-1">/</span>
                            )}
                            {(totalChangesetCount > 0 || !!campaign) && (
                                <>
                                    {totalChangesetCount} {pluralize('Changeset', totalChangesetCount)}
                                </>
                            )}{' '}
                            {campaign && patchSet && (
                                <CampaignDiffStat campaign={campaign} patchSet={patchSet} className="ml-2 mb-0" />
                            )}
                        </h3>
                        {totalPatchCount > 0 &&
                            (campaign ? (
                                <CampaignPatches
                                    campaign={campaign}
                                    campaignUpdates={campaignUpdates}
                                    changesetUpdates={changesetUpdates}
                                    enablePublishing={!campaign.closedAt}
                                    queryPatchesFromCampaign={queryPatchesFromCampaign}
                                    queryPatchFileDiffs={queryPatchFileDiffs}
                                    history={history}
                                    location={location}
                                    isLightTheme={isLightTheme}
                                />
                            ) : (
                                <PatchSetPatches
                                    patchSet={patchSet!}
                                    campaignUpdates={campaignUpdates}
                                    changesetUpdates={changesetUpdates}
                                    enablePublishing={false}
                                    queryPatchesFromPatchSet={queryPatchesFromPatchSet}
                                    queryPatchFileDiffs={queryPatchFileDiffs}
                                    history={history}
                                    location={location}
                                    isLightTheme={isLightTheme}
                                />
                            ))}
                        {totalChangesetCount > 0 && (
                            <CampaignChangesets
                                campaign={campaign}
                                changesetUpdates={changesetUpdates}
                                campaignUpdates={campaignUpdates}
                                queryChangesets={queryChangesets}
                                history={history}
                                location={location}
                                isLightTheme={isLightTheme}
                                extensionsController={extensionsController}
                                platformContext={platformContext}
                                telemetryService={telemetryService}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    )
}
