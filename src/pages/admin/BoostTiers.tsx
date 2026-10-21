import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { boostTiersApi } from '../../api/boostTiers';
import { BoostTierFormDialog } from '../../components/admin/BoostTierFormDialog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { extractErrorMessage } from '../../lib/errors';
import { formatPrice } from '../../lib/formatPrice';
import { sortBoostTiers, upsertBoostTier } from '../../lib/boostTiers/order';
import type { BoostTierFormInput } from '../../lib/boostTiers/validation';
import type { ApiResponse } from '../../types/api';
import type { BoostTier, BoostTierFormValues } from '../../types/boostTiers';

interface FormDialogConfig {
    title: string;
    submitLabel: string;
    initialValues: BoostTierFormInput;
    lockedCode?: string;
    submit: (values: BoostTierFormValues) => Promise<ApiResponse<BoostTier>>;
}

const EMPTY_FORM: BoostTierFormInput = { code: '', name: '', price: '', duration: '' };
const COLUMNS = ['Name', 'Code', 'Price', 'Duration', 'Status', 'Actions'];

function createDialog(): FormDialogConfig {
    return {
        title: 'New boost tier',
        submitLabel: 'Create',
        initialValues: EMPTY_FORM,
        submit: (values) => boostTiersApi.create(values),
    };
}

function editDialog(tier: BoostTier): FormDialogConfig {
    return {
        title: `Edit ${tier.name}`,
        submitLabel: 'Save',
        lockedCode: tier.code,
        initialValues: {
            code: tier.code,
            name: tier.name,
            price: String(tier.price_sek),
            duration: String(tier.duration_days),
        },
        submit: ({ name, price_sek, duration_days }) =>
            boostTiersApi.update(tier.id, { name, price_sek, duration_days, is_active: tier.is_active }),
    };
}

export const BoostTiers = () => {
    const [tiers, setTiers] = useState<BoostTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formDialog, setFormDialog] = useState<FormDialogConfig | null>(null);
    const [deactivating, setDeactivating] = useState<BoostTier | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const response = await boostTiersApi.listAll();
                if (response.status === 'success' && response.data) {
                    setTiers(sortBoostTiers(response.data));
                } else {
                    setError(response.message || 'Failed to load boost tiers');
                }
            } catch (err) {
                setError(extractErrorMessage(err, 'Failed to load boost tiers'));
            } finally {
                setLoading(false);
            }
        };
        fetchTiers();
    }, []);

    const handleSaved = (tier: BoostTier) => {
        setTiers((current) => upsertBoostTier(current, tier));
        setFormDialog(null);
    };

    const setActive = async (tier: BoostTier, isActive: boolean) => {
        setError(null);
        setUpdatingStatus(true);
        try {
            const response = await boostTiersApi.update(tier.id, {
                name: tier.name,
                price_sek: tier.price_sek,
                duration_days: tier.duration_days,
                is_active: isActive,
            });
            if (response.status === 'success' && response.data) {
                handleSaved(response.data);
            } else {
                setError(response.message || 'Failed to update boost tier');
            }
        } catch (err) {
            setError(extractErrorMessage(err, 'Failed to update boost tier'));
        } finally {
            setUpdatingStatus(false);
            setDeactivating(null);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-xl font-semibold text-black dark:text-white">Boost tiers</h4>
                    <p className="text-sm text-gray-500">Prices include 25% moms. Changes apply to new purchases only.</p>
                </div>
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setFormDialog(createDialog())}>
                    New tier
                </Button>
            </div>

            {error && (
                <div role="alert" className="mb-4 text-red-500 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex flex-col">
                <div className="grid grid-cols-6 rounded-sm bg-gray-2 dark:bg-meta-4">
                    {COLUMNS.map((column) => (
                        <div key={column} className="p-2.5 xl:p-5">
                            <h5 className="text-sm font-medium uppercase">{column}</h5>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="p-10 text-center">Loading boost tiers...</div>
                ) : tiers.length === 0 ? (
                    <div className="p-10 text-center">No boost tiers yet.</div>
                ) : (
                    tiers.map((tier) => (
                        <div
                            key={tier.id}
                            data-testid="boost-tier-row"
                            className="grid grid-cols-6 items-center border-b border-stroke dark:border-strokedark last:border-b-0"
                        >
                            <p className="p-2.5 xl:p-5 text-black dark:text-white">{tier.name}</p>
                            <p className="p-2.5 xl:p-5 font-mono text-sm">{tier.code}</p>
                            <p className="p-2.5 xl:p-5">{formatPrice(tier.price_sek)}</p>
                            <p className="p-2.5 xl:p-5">{tier.duration_days} days</p>
                            <div className="p-2.5 xl:p-5">
                                <Badge size="sm" variant={tier.is_active ? 'success' : 'error'}>
                                    {tier.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 xl:p-5">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    aria-label={`Edit ${tier.name}`}
                                    onClick={() => setFormDialog(editDialog(tier))}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                {tier.is_active ? (
                                    <Button size="sm" variant="outline" onClick={() => setDeactivating(tier)}>
                                        Deactivate
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" disabled={updatingStatus} onClick={() => setActive(tier, true)}>
                                        Activate
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {formDialog && (
                <BoostTierFormDialog
                    open
                    onClose={() => setFormDialog(null)}
                    title={formDialog.title}
                    submitLabel={formDialog.submitLabel}
                    initialValues={formDialog.initialValues}
                    lockedCode={formDialog.lockedCode}
                    submit={formDialog.submit}
                    onSaved={handleSaved}
                />
            )}

            <ConfirmDialog
                open={deactivating !== null}
                title={`Deactivate ${deactivating?.name ?? ''}?`}
                message="Sellers will no longer be able to buy this tier. Boosts already bought with it keep running until they end."
                confirmLabel="Deactivate"
                isConfirming={updatingStatus}
                onConfirm={() => deactivating && setActive(deactivating, false)}
                onCancel={() => setDeactivating(null)}
            />
        </div>
    );
};
