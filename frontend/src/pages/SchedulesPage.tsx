import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  RefreshCw,
  Tractor,
  Calendar,
  Hourglass,
  Sliders,
} from 'lucide-react';

import { maintenanceService } from '../services/maintenanceService';
import { equipmentService } from '../services/equipmentService';
import {
  MaintenanceSchedule,
  MaintenanceScheduleRequest,
} from '../types/maintenance';

import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import MaintenanceScheduleForm from '../components/forms/MaintenanceScheduleForm';
import { formatDate, formatNumber } from '../lib/utils';

export default function SchedulesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  // Queries
  const { data: allSchedules = [], isLoading } = useQuery({
    queryKey: ['schedulesList'],
    queryFn: () => maintenanceService.getSchedules(),
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ['upcomingSchedules'],
    queryFn: () => maintenanceService.getUpcomingSchedules(),
  });

  const { data: overdue = [] } = useQuery({
    queryKey: ['overdueSchedules'],
    queryFn: () => maintenanceService.getOverdueSchedules(),
  });

  const { data: activeEquipment = [] } = useQuery({
    queryKey: ['activeEquipment'],
    queryFn: equipmentService.getAllActive,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (req: MaintenanceScheduleRequest) => maintenanceService.createSchedule(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulesList'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['overdueSchedules'] });
      setShowAddModal(false);
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () => maintenanceService.evaluateAlerts(),
    onSuccess: (res) => {
      setEvalResult(res || 'Alert evaluation completed successfully.');
      queryClient.invalidateQueries({ queryKey: ['schedulesList'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['overdueSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const equipmentOptions = activeEquipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Maintenance Schedules & Advance Alerts
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configure periodic service intervals by calendar dates or operating hours (e.g. 250 hr standard service).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => evaluateMutation.mutate()}
            loading={evaluateMutation.isPending}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" /> Run Alert Check
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Service Program
          </Button>
        </div>
      </div>

      {/* Alert banner if evaluated */}
      {evalResult && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-600" />
            <span>{evalResult}</span>
          </div>
          <button
            onClick={() => setEvalResult(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overdue Alerts Section if any exist */}
      {overdue.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Critical: Overdue Maintenance Required ({overdue.length} machines)
            </h3>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overdue.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-rose-200 bg-white p-3 shadow-sm dark:border-rose-900/40 dark:bg-zinc-900"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-zinc-900 dark:text-white">{item.equipmentName}</h4>
                  <Badge variant="danger">Overdue</Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{item.serviceName}</p>
                <div className="mt-2 text-xs font-mono text-rose-600 dark:text-rose-400">
                  Current: {item.currentOperatingHours}h · Due Threshold: {item.nextDueHours ?? 'N/A'}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Alerts Section */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Hourglass className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Upcoming Service Alerts ({upcoming.length} programs)
            </h3>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-amber-200 bg-white p-3 shadow-sm dark:border-amber-900/40 dark:bg-zinc-900"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-zinc-900 dark:text-white">{item.equipmentName}</h4>
                  <Badge variant="warning">Upcoming</Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{item.serviceName}</p>
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  Due at {item.nextDueHours ?? 'N/A'} hrs (Current: {item.currentOperatingHours} hrs)
                  {item.nextDueDate && ` · Due on ${formatDate(item.nextDueDate)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Service Schedules ({allSchedules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : allSchedules.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-10 w-10 text-emerald-600" />}
              title="No service schedules configured"
              description="Create recurring maintenance programs for tractors, pumps, and harvesters."
              action={
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Service Program
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3.5">Machine</th>
                    <th className="px-4 py-3.5">Program Name</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Interval Rules</th>
                    <th className="px-4 py-3.5">Current vs Next Due</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {allSchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{s.equipmentName}</p>
                        <span className="font-mono text-xs text-zinc-400">
                          {s.equipmentRegistrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{s.serviceName}</p>
                        {s.remarks && <p className="text-xs text-zinc-400">{s.remarks}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{s.maintenanceType.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                        {s.intervalHours && <span>Every {s.intervalHours} operating hrs</span>}
                        {s.intervalDays && (
                          <span>
                            {s.intervalHours ? ' or ' : ''}Every {s.intervalDays} days
                          </span>
                        )}
                        <p className="text-zinc-400">Alert {s.advanceAlertHours}h / {s.advanceAlertDays}d ahead</p>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          Current: {s.currentOperatingHours} hrs
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400">
                          Next due: {s.nextDueHours ? `${s.nextDueHours} hrs` : 'N/A'}
                        </p>
                        {s.nextDueDate && (
                          <span className="text-zinc-400">Date: {formatDate(s.nextDueDate)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {s.isOverdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : s.isUpcoming ? (
                          <Badge variant="warning">Upcoming Alert</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Schedule Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Service Schedule Rule"
        size="md"
      >
        <MaintenanceScheduleForm
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

