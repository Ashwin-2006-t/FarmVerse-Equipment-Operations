import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  Filter,
  List,
  Calendar as CalendarIcon,
  AlertCircle,
  Check,
} from 'lucide-react';

import { bookingService } from '../services/bookingService';
import { equipmentService } from '../services/equipmentService';
import {
  BookingCreateRequest,
  BookingDecisionRequest,
  BookingStatus,
  EquipmentBooking,
} from '../types/booking';

import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/forms/BookingForm';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, formatDate } from '../lib/utils';

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin, isFarmer } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [decisionModal, setDecisionModal] = useState<{
    booking: EquipmentBooking;
    action: 'approve' | 'reject' | 'cancel';
  } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter, page],
    queryFn: () =>
      bookingService.getAll({
        status: (statusFilter as BookingStatus) || undefined,
        page,
        size: pageSize,
      }),
  });

  const { data: calendarBookings = [] } = useQuery({
    queryKey: ['calendarBookings'],
    queryFn: () => bookingService.getCalendar(),
    enabled: viewMode === 'calendar',
  });

  const { data: activeEquipment = [] } = useQuery({
    queryKey: ['activeEquipment'],
    queryFn: equipmentService.getAllActive,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (req: BookingCreateRequest) => bookingService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendarBookings'] });
      setShowAddModal(false);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setErrorMessage(msg);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingDecisionRequest }) =>
      bookingService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendarBookings'] });
      setDecisionModal(null);
      setRemarks('');
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Could not approve booking.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingDecisionRequest }) =>
      bookingService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendarBookings'] });
      setDecisionModal(null);
      setRemarks('');
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Could not reject booking.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingDecisionRequest }) =>
      bookingService.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendarBookings'] });
      setDecisionModal(null);
      setRemarks('');
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Could not cancel booking.');
    },
  });

  const handleDecisionSubmit = () => {
    if (!decisionModal) return;
    const { booking, action } = decisionModal;
    const payload: BookingDecisionRequest = { remarks };

    if (action === 'approve') {
      approveMutation.mutate({ id: booking.id, data: payload });
    } else if (action === 'reject') {
      rejectMutation.mutate({ id: booking.id, data: payload });
    } else if (action === 'cancel') {
      cancelMutation.mutate({ id: booking.id, data: payload });
    }
  };

  const isPendingDecision =
    approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;

  const equipmentOptions = activeEquipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    registrationNumber: eq.registrationNumber,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Equipment Bookings
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Schedule machine allocations, avoid double bookings, and manage approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Book Machine
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {[
          { label: 'All Requests', value: '' },
          { label: 'Pending Approval', value: 'PENDING' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Cancelled', value: 'CANCELLED' },
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

      {/* View Mode: LIST */}
      {viewMode === 'list' && (
        <>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-10 w-10 text-emerald-600" />}
              title="No bookings found"
              description="No booking records matched the selected status filter."
              action={
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Book Machine
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
                        <th className="px-4 py-3.5">Requested By</th>
                        <th className="px-4 py-3.5">Schedule Period</th>
                        <th className="px-4 py-3.5">Location & Purpose</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.content.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {b.equipmentName}
                            </p>
                            <span className="font-mono text-xs text-zinc-400">
                              {b.equipmentRegistrationNumber}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">{b.userName}</p>
                            <span className="text-xs text-zinc-400">{b.farmId}</span>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <p className="font-medium text-zinc-700 dark:text-zinc-300">
                              {formatDateTime(b.startTime)}
                            </p>
                            <span className="text-zinc-400">to {formatDateTime(b.endTime)}</span>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">
                              {b.workLocation}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400">{b.purpose}</p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={b.status} />
                            {b.approvalRemarks && (
                              <p className="mt-1 text-[11px] text-zinc-400 italic">
                                "{b.approvalRemarks}"
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Admin Approve / Reject actions */}
                              {isAdmin && b.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() =>
                                      setDecisionModal({ booking: b, action: 'approve' })
                                    }
                                    className="px-2.5 py-1 text-xs"
                                  >
                                    <Check className="mr-1 h-3 w-3" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() =>
                                      setDecisionModal({ booking: b, action: 'reject' })
                                    }
                                    className="px-2.5 py-1 text-xs"
                                  >
                                    <XCircle className="mr-1 h-3 w-3" /> Reject
                                  </Button>
                                </>
                              )}

                              {/* Farmer or Admin Cancel action */}
                              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setDecisionModal({ booking: b, action: 'cancel' })
                                  }
                                  className="text-xs text-zinc-500 hover:text-red-600"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
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
        </>
      )}

      {/* View Mode: CALENDAR / TIMELINE */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Fleet Schedule & Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {calendarBookings.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-400">
                No active or approved bookings scheduled on the calendar.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {calendarBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={b.status} />
                        <span className="text-xs font-mono text-zinc-400">
                          {b.equipmentRegistrationNumber}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {b.equipmentName}
                      </h4>
                      <p className="text-xs text-zinc-500">{b.workLocation}</p>
                    </div>

                    <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/50">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {formatDateTime(b.startTime)}
                          <br />→ {formatDateTime(b.endTime)}
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-400">
                        Booked by: <strong>{b.userName}</strong>
                      </p>
                      <p className="text-zinc-500 italic">"{b.purpose}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Booking Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Equipment Booking"
        size="md"
      >
        <BookingForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Decision Modal (Approve, Reject, Cancel) */}
      {decisionModal && (
        <Modal
          open={!!decisionModal}
          onClose={() => setDecisionModal(null)}
          title={
            decisionModal.action === 'approve'
              ? 'Approve Booking Request'
              : decisionModal.action === 'reject'
              ? 'Reject Booking Request'
              : 'Cancel Booking'
          }
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Machine: <strong>{decisionModal.booking.equipmentName}</strong>
              <br />
              Requested by: <strong>{decisionModal.booking.userName}</strong>
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Remarks / Notes
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes or reason..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDecisionModal(null)}
                disabled={isPendingDecision}
              >
                Cancel
              </Button>
              <Button
                variant={decisionModal.action === 'approve' ? 'primary' : 'danger'}
                onClick={handleDecisionSubmit}
                loading={isPendingDecision}
              >
                Confirm {decisionModal.action.toUpperCase()}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

