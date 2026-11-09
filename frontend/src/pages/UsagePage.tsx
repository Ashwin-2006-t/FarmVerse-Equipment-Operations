import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Gauge,
  Plus,
  Clock,
  Fuel,
  Coins,
  Tractor,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

import { usageService } from '../services/usageService';
import { equipmentService } from '../services/equipmentService';
import { EquipmentUsage, UsageCreateRequest } from '../types/usage';

import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import UsageForm from '../components/forms/UsageForm';
import StatsCard from '../components/ui/StatsCard';
import { formatCurrency, formatDate, formatNumber } from '../lib/utils';

export default function UsagePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>(undefined);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['usageList', selectedEquipmentId, page],
    queryFn: () =>
      usageService.getAll({
        equipmentId: selectedEquipmentId,
        page,
        size: pageSize,
      }),
  });

  const { data: activeEquipment = [] } = useQuery({
    queryKey: ['activeEquipment'],
    queryFn: equipmentService.getAllActive,
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: (req: UsageCreateRequest) => usageService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usageList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['activeEquipment'] });
      setShowAddModal(false);
    },
  });

  const equipmentOptions = activeEquipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    currentOperatingHours: eq.currentOperatingHours,
  }));

  // Aggregates for current page
  const totalHours = data?.content.reduce((sum, u) => sum + u.totalOperatingHours, 0) || 0;
  const totalFuel = data?.content.reduce((sum, u) => sum + u.fuelConsumedLitres, 0) || 0;
  const totalCost = data?.content.reduce((sum, u) => sum + u.totalUsageCost, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Equipment Usage Tracking
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Log completed farm operations, operating meter readings, and fuel consumption.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Log Operating Hours
        </Button>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Filter Machine:
          </label>
          <select
            value={selectedEquipmentId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setSelectedEquipmentId(val);
              setPage(0);
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">All Machinery Fleet</option>
            {activeEquipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.registrationNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-300">
          <div>
            Hours Logged: <strong className="text-emerald-600 dark:text-emerald-400">{formatNumber(totalHours, 1)} hrs</strong>
          </div>
          <div>
            Fuel Consumed: <strong>{formatNumber(totalFuel, 1)} L</strong>
          </div>
          <div>
            Total Cost: <strong>{formatCurrency(totalCost)}</strong>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-10 w-10 text-emerald-600" />}
          title="No usage records logged"
          description="Log hours when operators return machines from field work."
          action={
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Log Operating Hours
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3.5">Machine</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Hours (Start → End)</th>
                    <th className="px-4 py-3.5">Operating Hours</th>
                    <th className="px-4 py-3.5">Fuel Consumed</th>
                    <th className="px-4 py-3.5">Operator & Work</th>
                    <th className="px-4 py-3.5 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.content.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {u.equipmentName}
                        </p>
                        <span className="font-mono text-xs text-zinc-400">
                          {u.equipmentRegistrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {formatDate(u.usageDate)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                        {u.startOperatingHours}h → {u.endOperatingHours}h
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {u.totalOperatingHours} hrs
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {u.fuelConsumedLitres} L
                        </span>
                        {u.fuelCost > 0 && (
                          <p className="text-zinc-400">{formatCurrency(u.fuelCost)}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{u.operatorDetails}</p>
                        <p className="text-zinc-500">{u.workDescription}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(u.totalUsageCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-500">
              Showing {data.content.length} of {data.totalElements} records
            </span>
            <Pagination
              page={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Add Usage Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log Equipment Operating Hours"
        size="md"
      >
        <UsageForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}

