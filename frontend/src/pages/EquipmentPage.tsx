import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Tractor,
  Filter,
  Eye,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

import { equipmentService } from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import {
  Equipment,
  EquipmentCategory,
  EquipmentCreateRequest,
  EquipmentStatus,
} from '../types/equipment';
import { BookingCreateRequest } from '../types/booking';

import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EquipmentForm from '../components/forms/EquipmentForm';
import BookingForm from '../components/forms/BookingForm';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../lib/utils';

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: '' },
  { label: 'Tractors', value: 'TRACTORS' },
  { label: 'Harvesters', value: 'HARVESTERS' },
  { label: 'Water Pumps', value: 'WATER_PUMPS' },
  { label: 'Sprayers', value: 'SPRAYERS' },
  { label: 'Cultivators', value: 'CULTIVATORS' },
  { label: 'Seed Drills', value: 'SEED_DRILLS' },
  { label: 'Ploughs', value: 'PLOUGHS' },
  { label: 'Tillers', value: 'TILLERS' },
  { label: 'Trailers', value: 'TRAILERS' },
  { label: 'Other', value: 'OTHER' },
];

const STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Booked', value: 'BOOKED' },
  { label: 'In Use', value: 'IN_USE' },
  { label: 'Under Maintenance', value: 'UNDER_MAINTENANCE' },
  { label: 'Out of Service', value: 'OUT_OF_SERVICE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export default function EquipmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<Equipment | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Equipment | null>(null);

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['equipmentList', search, selectedCategory, selectedStatus, page],
    queryFn: () =>
      equipmentService.getAll({
        search: search || undefined,
        category: (selectedCategory as EquipmentCategory) || undefined,
        status: (selectedStatus as EquipmentStatus) || undefined,
        page,
        size: pageSize,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newEq: EquipmentCreateRequest) => equipmentService.create(newEq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      setShowAddModal(false);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (req: BookingCreateRequest) => bookingService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      setBookingTarget(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => equipmentService.deleteOrDeactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      setDeactivateTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Equipment Registry
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Monitor, inspect, and manage active machinery and field implements.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Machine
        </Button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sm:col-span-5">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
            placeholder="Search by name, brand, model or registration..."
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content state */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="font-semibold">Unable to fetch machinery fleet data.</p>
        </div>
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={<Tractor className="h-10 w-10 text-emerald-600" />}
          title="No machinery found"
          description="Try adjusting your search criteria or register a new piece of equipment."
          action={
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Register Equipment
            </Button>
          }
        />
      ) : (
        <>
          {/* Grid Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.content.map((item) => (
              <Card
                key={item.id}
                hover
                className="flex flex-col justify-between overflow-hidden border border-zinc-200 transition-all dark:border-zinc-800"
              >
                <div>
                  {/* Image or Category placeholder header */}
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback on broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                        <Tractor className="h-16 w-16 stroke-1" />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3
                        onClick={() => navigate(`/equipment/${item.id}`)}
                        className="cursor-pointer text-base font-bold text-zinc-900 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                      >
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.brand} {item.model}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-800">
                        <span className="text-zinc-400">Reg No:</span>
                        <span className="font-mono font-medium">{item.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-800">
                        <span className="text-zinc-400">Operating Hours:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(item.currentOperatingHours, 1)} hrs
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 pb-1 dark:border-zinc-800">
                        <span className="text-zinc-400">Fuel & Tank:</span>
                        <span>
                          {item.fuelType} · {item.fuelTankCapacity}L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Location:</span>
                        <span className="font-medium">{item.assignedFarmId}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/equipment/${item.id}`)}
                    className="text-xs"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> Details
                  </Button>

                  <div className="flex items-center gap-1">
                    {item.status === 'AVAILABLE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingTarget(item)}
                        className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                      >
                        <Calendar className="mr-1 h-3.5 w-3.5" /> Book
                      </Button>
                    )}

                    {isAdmin && (
                      <button
                        title="Deactivate"
                        onClick={() => setDeactivateTarget(item)}
                        className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-zinc-500">
              Showing {data.content.length} of {data.totalElements} records
            </span>
            <Pagination
              page={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </>
      )}

      {/* Add Equipment Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Farm Equipment"
        size="lg"
      >
        <EquipmentForm
          onSubmit={async (formData) => {
            await createMutation.mutateAsync(formData);
          }}
          onCancel={() => setShowAddModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Quick Booking Modal for Selected Equipment */}
      {bookingTarget && (
        <Modal
          open={!!bookingTarget}
          onClose={() => setBookingTarget(null)}
          title={`Book: ${bookingTarget.name}`}
          size="md"
        >
          <BookingForm
            equipmentId={bookingTarget.id}
            equipmentName={`${bookingTarget.name} (${bookingTarget.registrationNumber})`}
            onSubmit={async (data) => {
              await createBookingMutation.mutateAsync(data);
            }}
            onCancel={() => setBookingTarget(null)}
            loading={createBookingMutation.isPending}
          />
        </Modal>
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <ConfirmDialog
          open={!!deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)}
          title="Deactivate Equipment"
          message={`Are you sure you want to deactivate ${deactivateTarget.name}? If it has booking or maintenance history, it will be marked as INACTIVE without data loss.`}
          confirmLabel="Deactivate"
          variant="danger"
          loading={deactivateMutation.isPending}
        />
      )}
    </div>
  );
}

