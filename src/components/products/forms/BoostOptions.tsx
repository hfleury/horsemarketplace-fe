import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import { boostTiersApi } from '../../../api/boostTiers';
import { paymentsApi } from '../../../api/payments';
import type { BoostTier } from '../../../types/boostTiers';
import type { ProductFormValues } from '../../../lib/products/productFormValues';
import { sortBoostTiers } from '../../../lib/boostTiers/order';
import { formatPrice } from '../../../lib/formatPrice';
import { stockholmToday } from '../../../lib/stockholmDate';

type BoostOptionsState =
    | { status: 'loading' }
    | { status: 'failed' }
    | { status: 'ready'; tiers: BoostTier[]; providers: string[] };

async function loadBoostOptions(): Promise<BoostOptionsState> {
    try {
        const [tiersResponse, providersResponse] = await Promise.all([
            boostTiersApi.listActive(),
            paymentsApi.listProviders(),
        ]);
        if (tiersResponse.status !== 'success' || providersResponse.status !== 'success') {
            return { status: 'failed' };
        }
        return {
            status: 'ready',
            tiers: sortBoostTiers(tiersResponse.data ?? []),
            providers: providersResponse.data ?? [],
        };
    } catch {
        return { status: 'failed' };
    }
}

function tierLabel(tier: BoostTier): string {
    return `${tier.name} · ${tier.duration_days} days · ${formatPrice(tier.price_sek)} incl. moms`;
}

const labelClassName = 'block text-sm font-medium text-gray-700 mb-1';
const inputClassName =
    'w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary';

const BoostOptions = () => {
    const { register, setValue, watch, formState: { errors } } = useFormContext<ProductFormValues>();
    const [options, setOptions] = useState<BoostOptionsState>({ status: 'loading' });
    const selectedTier = watch('boost.tier_code');

    useEffect(() => {
        let isMounted = true;
        loadBoostOptions().then((loaded) => {
            if (!isMounted) return;
            setOptions(loaded);
            if (loaded.status === 'ready' && loaded.providers.length === 1) {
                setValue('boost.provider', loaded.providers[0]);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [setValue]);

    return (
        <section aria-labelledby="boost-options-heading" className="space-y-4 border-t pt-4 mt-4">
            <h3 id="boost-options-heading" className="text-lg font-medium text-gray-900">
                Boost your listing (optional)
            </h3>
            <p className="text-sm text-gray-600">
                The boost period starts on the chosen date, or when payment completes, even if the listing is
                still awaiting approval.
            </p>

            {options.status === 'loading' && <p className="text-sm text-gray-600">Loading boost options...</p>}
            {options.status === 'failed' && <p className="text-sm text-red-600">Boost options couldn't be loaded</p>}
            {options.status === 'ready' && (
                <BoostChoices
                    tiers={options.tiers}
                    providers={options.providers}
                    isTierChosen={!!selectedTier}
                    providerError={errors.boost?.provider?.message}
                    register={register}
                />
            )}
        </section>
    );
};

interface BoostChoicesProps {
    tiers: BoostTier[];
    providers: string[];
    isTierChosen: boolean;
    providerError?: string;
    register: UseFormRegister<ProductFormValues>;
}

const BoostChoices = ({ tiers, providers, isTierChosen, providerError, register }: BoostChoicesProps) => {
    const isBoostingAvailable = providers.length > 0;

    return (
        <>
            {!isBoostingAvailable && <p className="text-sm text-gray-600">Boosting is not available right now</p>}

            <fieldset disabled={!isBoostingAvailable} className="space-y-2">
                <legend className={labelClassName}>Boost tier</legend>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" value="" {...register('boost.tier_code')} />
                    No boost
                </label>
                {tiers.map((tier) => (
                    <label key={tier.code} className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="radio" value={tier.code} {...register('boost.tier_code')} />
                        {tierLabel(tier)}
                    </label>
                ))}
            </fieldset>

            {providers.length > 1 && (
                <div>
                    <label htmlFor="boost-provider" className={labelClassName}>
                        Payment provider
                    </label>
                    <select id="boost-provider" {...register('boost.provider')} className={inputClassName}>
                        <option value="">Select payment provider</option>
                        {providers.map((provider) => (
                            <option key={provider} value={provider}>
                                {provider}
                            </option>
                        ))}
                    </select>
                    {providerError && <p className="text-sm text-red-500 mt-1">{providerError}</p>}
                </div>
            )}

            {isTierChosen && (
                <div>
                    <label htmlFor="boost-starts-on" className={labelClassName}>
                        Start date — leave empty to start right away
                    </label>
                    <input
                        id="boost-starts-on"
                        type="date"
                        min={stockholmToday()}
                        {...register('boost.starts_on')}
                        className={inputClassName}
                    />
                </div>
            )}
        </>
    );
};

export default BoostOptions;
