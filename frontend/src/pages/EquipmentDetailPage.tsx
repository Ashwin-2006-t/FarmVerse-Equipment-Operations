import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Wrench,
  Edit,
  Trash2,
  Tractor,
  Fuel,
  Coins,
  ShieldCheck,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react';

import { equipmentService } from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import { usageService } from '../services/usageService';
import { maintenanceService } from '../services/maintenanceService';

import {
  Equipment,
  EquipmentStatus,
  EquipmentUpdateRequest,
} from '../types/equipment';
import { BookingCreateRequest } from '../types/booking';
import { UsageCreateRequest } from '../types/usage';
import { MaintenanceCreateRequest } from '../types/maintenance';

import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EquipmentForm from '../components/forms/EquipmentForm';
import BookingForm from '../components/forms/BookingForm';
import UsageForm from '../components/forms/UsageForm';
import MaintenanceForm from '../components/forms/MaintenanceForm';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const equipmentId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'usage' | 'maintenance'>(
    'overview'
  );

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<EquipmentStatus>('AVAILABLE');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Equipment query
  const {
    data: equipment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['equipmentDetail', equipmentId],
    queryFn: () => equipmentService.getById(equipmentId),
    enabled: !isNaN(equipmentId),
  });

  // Tab sub-queries
  const { data: bookings = [] } = useQuery({
    queryKey: ['equipmentBookings', equipmentId],
    queryFn: () => equipmentService.getBookings(equipmentId),
    enabled: activeTab === 'bookings' && !isNaN(equipmentId),
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ['equipmentUsage', equipmentId],
    queryFn: () => equipmentService.getUsage(equipmentId),
    enabled: activeTab === 'usage' && !isNaN(equipmentId),
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['equipmentMaintenance', equipmentId],
    queryFn: () => equipmentService.getMaintenance(equipmentId),
    enabled: activeTab === 'maintenance' && !isNaN(equipmentId),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: EquipmentUpdateRequest) => equipmentService.update(equipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentDetail', equipmentId] });
      setShowEditModal(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: () => equipmentService.updateStatus(equipmentId, newStatus, statusRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentDetail', equipmentId] });
      setShowStatusModal(false);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: BookingCreateRequest) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentDetail', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipmentBookings', equipmentId] });
      setShowBookingModal(false);
    },
  });

  const createUsageMutation = useMutation({
    mutationFn: (data: UsageCreateRequest) => usageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentDetail', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipmentUsage', equipmentId] });
      setShowUsageModal(false);
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: (data: MaintenanceCreateRequest) => maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentDetail', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipmentMaintenance', equipmentId] });
      setShowMaintenanceModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !equipment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <h3 className="text-lg font-bold">Equipment Not Found</h3>
        <p className="mt-1 text-sm text-red-600">The requested equipment record does not exist or has been removed.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/equipment')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Equipment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/equipment')}
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Equipment Directory
        </button>
      </div>

      {/* Main Machine Banner Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Tractor className="h-10 w-10" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{equipment.name}</h2>
                <StatusBadge status={equipment.status} />
                <Badge variant="outline">{equipment.category.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {equipment.brand} {equipment.model} · Reg: <span className="font-mono font-medium">{equipment.registrationNumber}</span> · Serial: <span className="font-mono">{equipment.serialNumber}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewStatus(equipment.status);
                setShowStatusModal(true);
              }}
            >
              Change Status
            </Button>
            {equipment.status === 'AVAILABLE' && (
              <Button variant="primary" size="sm" onClick={() => setShowBookingModal(true)}>
                <Calendar className="mr-1.5 h-3.5 w-3.5" /> Book Machine
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowUsageModal(true)}>
              <Clock className="mr-1.5 h-3.5 w-3.5" /> Log Usage
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowMaintenanceModal(true)}>
              <Wrench className="mr-1.5 h-3.5 w-3.5" /> Log Service
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-zinc-200 dark:border-zinc-800">
          {(['overview', 'bookings', 'usage', 'maintenance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'usage' ? 'Operating Logs' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Total Operating Hours</span>
                  <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(equipment.currentOperatingHours, 1)} hrs
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Condition Rating</span>
                  <p className="mt-1 text-xl font-bold text-zinc-800 dark:text-zinc-100">
                    {equipment.equipmentCondition}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Fuel System</span>
                  <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {equipment.fuelType} · {equipment.fuelTankCapacity} L Capacity
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Purchase Cost</span>
                  <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {formatCurrency(equipment.purchaseCost)}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Purchase Date</span>
                  <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {formatDate(equipment.purchaseDate)}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Assigned Farm Location</span>
                  <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {equipment.assignedFarmId}
                  </p>
                </div>
              </div>

              {equipment.description && (
                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Description & Field Notes
                  </h4>
                  <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                    {equipment.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info & Telematics side card */}
          <Card>
            <CardHeader>
              <CardTitle>System & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <span className="text-zinc-400">Unique ID:</span>
                <span className="font-mono font-medium">{equipment.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <span className="text-zinc-400">Organization ID:</span>
                <span className="font-mono">{equipment.organizationId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <span className="text-zinc-400">Registered On:</span>
                <span>{formatDate(equipment.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Last Modified:</span>
                <span>{formatDateTime(equipment.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: BOOKINGS */}
      {activeTab === 'bookings' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking History for this Equipment</CardTitle>
            {equipment.status === 'AVAILABLE' && (
              <Button size="sm" variant="primary" onClick={() => setShowBookingModal(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> New Booking
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">No booking requests found for this machine.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 dark:border-zinc-800">
                    <tr>
                      <th className="pb-3">Farmer / User</th>
                      <th className="pb-3">Start Time</th>
                      <th className="pb-3">End Time</th>
                      <th className="pb-3">Work Location</th>
                      <th className="pb-3">Purpose</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200">{b.userName}</td>
                        <td className="py-3 text-zinc-500">{formatDateTime(b.startTime)}</td>
                        <td className="py-3 text-zinc-500">{formatDateTime(b.endTime)}</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-300">{b.workLocation}</td>
                        <td className="py-3 text-zinc-500">{b.purpose}</td>
                        <td className="py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content: USAGE LOGS */}
      {activeTab === 'usage' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Operating & Fuel Records</CardTitle>
            <Button size="sm" variant="primary" onClick={() => setShowUsageModal(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Log Operating Hours
            </Button>
          </CardHeader>
          <CardContent>
            {usageLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">No usage logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 dark:border-zinc-800">
                    <tr>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Hours (Start → End)</th>
                      <th className="pb-3">Total Hours</th>
                      <th className="pb-3">Fuel (L)</th>
                      <th className="pb-3">Operator</th>
                      <th className="pb-3">Work Description</th>
                      <th className="pb-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {usageLogs.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200">{formatDate(u.usageDate)}</td>
                        <td className="py-3 font-mono text-xs text-zinc-500">
                          {u.startOperatingHours}h → {u.endOperatingHours}h
                        </td>
                        <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {u.totalOperatingHours} hrs
                        </td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-300">{u.fuelConsumedLitres} L</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-300">{u.operatorDetails}</td>
                        <td className="py-3 text-zinc-500">{u.workDescription}</td>
                        <td className="py-3 text-right font-medium text-zinc-800 dark:text-zinc-200">
                          {formatCurrency(u.totalUsageCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Maintenance & Repair Log</CardTitle>
            <Button size="sm" variant="primary" onClick={() => setShowMaintenanceModal(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Service Record
            </Button>
          </CardHeader>
          <CardContent>
            {maintenanceRecords.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">No maintenance records logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 dark:border-zinc-800">
                    <tr>
                      <th className="pb-3">Service Date</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Technician / Provider</th>
                      <th className="pb-3">At Hours</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {maintenanceRecords.map((m) => (
                      <tr key={m.id}>
                        <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200">{formatDate(m.serviceDate)}</td>
                        <td className="py-3 font-medium text-zinc-700 dark:text-zinc-300">
                          {m.maintenanceType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 text-zinc-500">
                          {m.technicianName} ({m.serviceProvider})
                        </td>
                        <td className="py-3 font-mono text-xs text-zinc-500">{m.previousOperatingHours} hrs</td>
                        <td className="py-3"><StatusBadge status={m.status} /></td>
                        <td className="py-3 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                          {formatCurrency(m.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Equipment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Equipment Details"
        size="lg"
      >
        <EquipmentForm
          initialData={equipment}
          onSubmit={async (formData) => {
            await updateMutation.mutateAsync(formData);
          }}
          onCancel={() => setShowEditModal(false)}
          loading={updateMutation.isPending}
        />
      </Modal>

      {/* Change Status Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Equipment Status"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as EquipmentStatus)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED</option>
              <option value="IN_USE">IN_USE</option>
              <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Remarks</label>
            <textarea
              rows={3}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="Reason for status change..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => updateStatusMutation.mutate()}
              loading={updateStatusMutation.isPending}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Booking Modal */}
      <Modal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={`Book Machine: ${equipment.name}`}
        size="md"
      >
        <BookingForm
          equipmentId={equipment.id}
          equipmentName={`${equipment.name} (${equipment.registrationNumber})`}
          onSubmit={async (data) => {
            await createBookingMutation.mutateAsync(data);
          }}
          onCancel={() => setShowBookingModal(false)}
          loading={createBookingMutation.isPending}
        />
      </Modal>

      {/* Usage Modal */}
      <Modal
        open={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        title={`Log Usage: ${equipment.name}`}
        size="md"
      >
        <UsageForm
          equipmentId={equipment.id}
          equipmentName={equipment.name}
          currentHours={equipment.currentOperatingHours}
          onSubmit={async (data) => {
            await createUsageMutation.mutateAsync(data);
          }}
          onCancel={() => setShowUsageModal(false)}
          loading={createUsageMutation.isPending}
        />
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        open={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title={`Record Maintenance: ${equipment.name}`}
        size="lg"
      >
        <MaintenanceForm
          equipmentId={equipment.id}
          equipmentName={equipment.name}
          currentHours={equipment.currentOperatingHours}
          onSubmit={async (data) => {
            await createMaintenanceMutation.mutateAsync(data);
          }}
          onCancel={() => setShowMaintenanceModal(false)}
          loading={createMaintenanceMutation.isPending}
        />
      </Modal>
    </div>
  );
}

