import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tractor,
  CheckCircle2,
  Clock,
  Wrench,
  AlertOctagon,
  Fuel,
  Coins,
  Plus,
  CalendarDays,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import StatsCard from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import EquipmentForm from '../components/forms/EquipmentForm';
import BookingForm from '../components/forms/BookingForm';
import UsageForm from '../components/forms/UsageForm';
import MaintenanceForm from '../components/forms/MaintenanceForm';

import { dashboardService } from '../services/dashboardService';
import { equipmentService } from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import { usageService } from '../services/usageService';
import { maintenanceService } from '../services/maintenanceService';
import { formatCurrency, formatDate, formatNumber } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { EquipmentCreateRequest } from '../types/equipment';
import { BookingCreateRequest } from '../types/booking';
import { UsageCreateRequest } from '../types/usage';
import { MaintenanceCreateRequest } from '../types/maintenance';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  BOOKED: '#3b82f6',
  IN_USE: '#f59e0b',
  UNDER_MAINTENANCE: '#ef4444',
  OUT_OF_SERVICE: '#6b7280',
  INACTIVE: '#9ca3af',
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Modals state
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showAddUsage, setShowAddUsage] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);

  // Queries
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: utilization } = useQuery({
    queryKey: ['utilizationAnalytics'],
    queryFn: dashboardService.getUtilizationAnalytics,
  });

  const { data: activeEquipment = [] } = useQuery({
    queryKey: ['activeEquipment'],
    queryFn: equipmentService.getAllActive,
  });

  // Mutations
  const createEquipmentMutation = useMutation({
    mutationFn: (data: EquipmentCreateRequest) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['activeEquipment'] });
      setShowAddEquipment(false);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: BookingCreateRequest) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setShowAddBooking(false);
    },
  });

  const createUsageMutation = useMutation({
    mutationFn: (data: UsageCreateRequest) => usageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setShowAddUsage(false);
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: (data: MaintenanceCreateRequest) => maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setShowAddMaintenance(false);
    },
  });

  if (isSummaryLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (summaryError || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertOctagon className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <h3 className="text-lg font-bold">Failed to load dashboard metrics</h3>
        <p className="mt-1 text-sm text-red-600">Please check backend connectivity and reload.</p>
      </div>
    );
  }

  // Prepare status chart data
  const statusChartData = Object.entries(summary.statusCounts || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    rawStatus: name,
    value,
  }));

  // Equipment list mapped for dropdowns
  const equipmentOptions = activeEquipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    registrationNumber: eq.registrationNumber,
    currentOperatingHours: eq.currentOperatingHours,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white shadow-lg">
        <div>
          <span className="inline-block rounded-full bg-emerald-700/60 px-3 py-1 text-xs font-semibold text-emerald-200">
            FARM OPERATIONS HUB
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Farm Manager'}!
          </h2>
          <p className="mt-1 text-sm text-emerald-200/80">
            Real-time agricultural fleet health, scheduling, and telematics overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowAddBooking(true)}
          >
            <CalendarDays className="mr-1.5 h-4 w-4" /> Book Machine
          </Button>
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowAddUsage(true)}
          >
            <Clock className="mr-1.5 h-4 w-4" /> Log Usage
          </Button>
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowAddMaintenance(true)}
          >
            <Wrench className="mr-1.5 h-4 w-4" /> Log Service
          </Button>
          <Button
            variant="primary"
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
            onClick={() => setShowAddEquipment(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Equipment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Fleet Size"
          value={summary.totalEquipment}
          subtitle={`${summary.availableEquipment} Available right now`}
          icon={<Tractor className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Active Operations"
          value={summary.inUseEquipment + summary.bookedEquipment}
          subtitle={`${summary.inUseEquipment} in field, ${summary.bookedEquipment} booked`}
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Maintenance Alert"
          value={summary.underMaintenanceEquipment + summary.upcomingMaintenanceCount}
          subtitle={`${summary.underMaintenanceEquipment} in workshop, ${summary.upcomingMaintenanceCount} upcoming`}
          icon={<Wrench className="h-6 w-6" />}
          color="amber"
        />
        <StatsCard
          title="Total Operating Hours"
          value={`${formatNumber(summary.totalOperatingHours, 0)} hrs`}
          subtitle={`${formatNumber(summary.totalFuelConsumptionLitres, 0)} L total fuel consumed`}
          icon={<Fuel className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Second Row of Financial & Operational Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Maintenance Expense</span>
            <Coins className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(summary.totalMaintenanceExpenditure)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Cumulative servicing & replacement costs</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Field Usage Cost</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(summary.totalUsageCost)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Fuel & operating costs incurred</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
            {summary.pendingBookingCount} Requests
          </p>
          <Link
            to="/bookings"
            className="mt-1 inline-flex items-center text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Review booking requests <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fleet Status Donut */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Fleet Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-400">No equipment registered yet</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={STATUS_COLORS[entry.rawStatus] || '#10b981'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
                  {statusChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.rawStatus] || '#10b981' }}
                      />
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {item.name}: <strong>{item.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category-wise Operating Hours */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Category Utilization & Operating Hours</CardTitle>
            <Link
              to="/analytics"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Full Analytics →
            </Link>
          </CardHeader>
          <CardContent>
            {utilization?.categoryUtilization && utilization.categoryUtilization.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={utilization.categoryUtilization}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: number) => [`${val} hrs`, 'Operating Hours']}
                    />
                    <Bar
                      dataKey="totalHours"
                      name="Total Hours"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
                Log equipment usage to visualize hours per category.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operational Feeds: Recent Bookings & Maintenance Watchlist */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Booking Activity</CardTitle>
            <Link
              to="/bookings"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Manage all bookings →
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {summary.recentBookings && summary.recentBookings.length > 0 ? (
              summary.recentBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{b.equipmentName}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {b.userName} · {b.workLocation} ({formatDate(b.startTime)})
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {b.equipmentRegistrationNumber}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-zinc-400">No recent booking records</p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance / Schedule Watchlist */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Maintenance & Alerts</CardTitle>
            <Link
              to="/schedules"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View all schedules →
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {summary.upcomingSchedules && summary.upcomingSchedules.length > 0 ? (
              summary.upcomingSchedules.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{s.equipmentName}</p>
                      {s.isOverdue ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : s.isUpcoming ? (
                        <Badge variant="warning">Upcoming</Badge>
                      ) : (
                        <Badge variant="info">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {s.serviceName} · Due at {s.nextDueHours ?? 'N/A'} hrs (Current: {s.currentOperatingHours} hrs)
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {s.nextDueDate ? formatDate(s.nextDueDate) : 'Hours based'}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-zinc-400">All equipment maintenance is up to date!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Modals */}
      <Modal
        open={showAddEquipment}
        onClose={() => setShowAddEquipment(false)}
        title="Register New Equipment"
        size="lg"
      >
        <EquipmentForm
          onSubmit={async (data) => {
            await createEquipmentMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddEquipment(false)}
          loading={createEquipmentMutation.isPending}
        />
      </Modal>

      <Modal
        open={showAddBooking}
        onClose={() => setShowAddBooking(false)}
        title="Schedule Equipment Booking"
        size="md"
      >
        <BookingForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createBookingMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddBooking(false)}
          loading={createBookingMutation.isPending}
        />
      </Modal>

      <Modal
        open={showAddUsage}
        onClose={() => setShowAddUsage(false)}
        title="Log Completed Work & Operating Hours"
        size="md"
      >
        <UsageForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createUsageMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddUsage(false)}
          loading={createUsageMutation.isPending}
        />
      </Modal>

      <Modal
        open={showAddMaintenance}
        onClose={() => setShowAddMaintenance(false)}
        title="Record Equipment Maintenance"
        size="lg"
      >
        <MaintenanceForm
          equipmentList={equipmentOptions}
          onSubmit={async (data) => {
            await createMaintenanceMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddMaintenance(false)}
          loading={createMaintenanceMutation.isPending}
        />
      </Modal>
    </div>
  );
}

