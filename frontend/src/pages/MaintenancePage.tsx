import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wrench,
  Plus,
  AlertTriangle,
  Clock,
  Coins,
  CheckCircle2,
  FileText,
  User,
  Building,
} from 'lucide-react';

import { maintenanceService } from '../services/maintenanceService';
import { equipmentService } from '../services/equipmentService';
import {
  MaintenanceCreateRequest,
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceType,
  MaintenanceUpdateRequest,
} from '../types/maintenance';

import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import MaintenanceForm from '../components/forms/MaintenanceForm';
import { formatCurrency, formatDate, formatNumber } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { isAdmin, isTechnician } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRecord | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['maintenanceList', statusFilter, page],
    queryFn: () =>
      maintenanceService.getAll({
        status: (statusFilter as MaintenanceStatus) || undefined,
        page,
        size: pageSize,
      }),
  });

  const { data: activeEquipment = [] } = useQuery({
    queryKey: ['activeEquipment'],
    queryFn: equipmentService.getAllActive,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (req: MaintenanceCreateRequest) => maintenanceService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaintenanceUpdateRequest }) =>
      maintenanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setEditRecord(null);
    },
  });

  const equipmentOptions = activeEquipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    currentOperatingHours: eq.currentOperatingHours,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Maintenance Management
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Log scheduled servicing, emergency repairs, parts replacement, and labour expenses.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Log Service or Repair
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {[
          { label: 'All Records', value: '' },
          { label: 'Scheduled', value: 'SCHEDULED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Overdue', value: 'OVERDUE' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-10 w-10 text-emerald-600" />}
          title="No maintenance records found"
          description="Keep machinery in peak working condition by logging routine or breakdown servicing."
          action={
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Log Service or Repair
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
                    <th className="px-4 py-3.5">Equipment</th>
                    <th className="px-4 py-3.5">Service Type</th>
                    <th className="px-4 py-3.5">Date & Hours</th>
                    <th className="px-4 py-3.5">Provider / Tech</th>
                    <th className="px-4 py-3.5">Description</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Total Cost</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.content.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {m.equipmentName}
                        </p>
                        <span className="font-mono text-xs text-zinc-400">
                          {m.equipmentRegistrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">
                          {m.maintenanceType.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {formatDate(m.serviceDate)}
                        </p>
                        <span className="text-zinc-400">at {m.previousOperatingHours} hrs</span>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {m.technicianName}
                        </p>
                        <p className="text-zinc-400">{m.serviceProvider}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                        {m.description}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(m.totalCost)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditRecord(m)}
                          className="text-xs"
                        >
                          Update
                        </Button>
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

      {/* Add Maintenance Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Equipment Maintenance"
        size="lg"
      >
        <MaintenanceForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Maintenance Modal */}
      {editRecord && (
        <Modal
          open={!!editRecord}
          onClose={() => setEditRecord(null)}
          title={`Update Service: ${editRecord.equipmentName}`}
          size="lg"
        >
          <MaintenanceForm
            initialData={editRecord}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({
                id: editRecord.id,
                data: {
                  maintenanceType: data.maintenanceType,
                  description: data.description,
                  serviceDate: data.serviceDate,
                  serviceProvider: data.serviceProvider,
                  technicianName: data.technicianName,
                  labourCost: data.labourCost,
                  sparePartsCost: data.sparePartsCost,
                  additionalCost: data.additionalCost,
                  previousOperatingHours: data.previousOperatingHours,
                  nextServiceDate: data.nextServiceDate,
                  nextServiceOperatingHourThreshold: data.nextServiceOperatingHourThreshold,
                  status: 'COMPLETED',
                  remarks: data.remarks,
                },
              });
            }}
            onCancel={() => setEditRecord(null)}
            loading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

