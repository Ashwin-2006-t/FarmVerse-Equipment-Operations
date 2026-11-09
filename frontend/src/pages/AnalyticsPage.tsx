import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Fuel,
  Wrench,
  Tractor,
  Coins,
  Percent,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, formatNumber } from '../lib/utils';

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'utilization' | 'maintenance' | 'fuel'>('utilization');

  const { data: utilization, isLoading: isUtilLoading } = useQuery({
    queryKey: ['utilizationAnalytics'],
    queryFn: dashboardService.getUtilizationAnalytics,
  });

  const { data: maintenanceCost, isLoading: isMaintLoading } = useQuery({
    queryKey: ['maintenanceCostAnalytics'],
    queryFn: dashboardService.getMaintenanceCostAnalytics,
  });

  const { data: fuelAnalytics, isLoading: isFuelLoading } = useQuery({
    queryKey: ['fuelAnalytics'],
    queryFn: dashboardService.getFuelConsumptionAnalytics,
  });

  const isLoading = isUtilLoading || isMaintLoading || isFuelLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Agricultural Fleet Analytics & Telematics
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Machine utilization ratios, expenditure breakdowns, and fuel consumption trends.
          </p>
        </div>

        {/* Analytics Mode Tabs */}
        <div className="flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('utilization')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'utilization'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Utilization
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'maintenance'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Maintenance Costs
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'fuel'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Fuel Efficiency
          </button>
        </div>
      </div>

      {/* TAB 1: UTILIZATION */}
      {activeTab === 'utilization' && (
        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCard
              title="Overall Fleet Utilization"
              value={`${formatNumber(utilization?.overallUtilizationPercentage || 0, 1)}%`}
              subtitle="Hours logged vs scheduled capacity"
              icon={<Percent className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Total Operating Hours"
              value={`${formatNumber(utilization?.totalOperatingHours || 0, 1)} hrs`}
              subtitle="Active farm operational field time"
              icon={<Tractor className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Capacity Base"
              value={`${formatNumber(utilization?.standardCapacityOperatingHours || 0, 0)} hrs`}
              subtitle="Standard monthly operating capacity"
              icon={<Calendar className="h-6 w-6" />}
              color="zinc"
            />
          </div>

          {/* Machine by Machine Utilization */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Machine-Wise Utilization %</CardTitle>
              </CardHeader>
              <CardContent>
                {utilization?.equipmentUtilization && utilization.equipmentUtilization.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={utilization.equipmentUtilization}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          unit="%"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="equipmentName"
                          tick={{ fontSize: 11 }}
                          width={120}
                        />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Utilization']} />
                        <Bar
                          dataKey="utilizationPercentage"
                          fill="#059669"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-zinc-400">No utilization data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Utilization Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {utilization?.categoryUtilization && utilization.categoryUtilization.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={utilization.categoryUtilization}
                        margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 10 }}
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="averageHoursPerMachine"
                          name="Avg Hours / Machine"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-zinc-400">No category breakdown available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE COSTS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatsCard
              title="Total Maintenance Cost"
              value={formatCurrency(maintenanceCost?.totalExpenditure || 0)}
              subtitle="All servicing & repairs"
              icon={<Coins className="h-6 w-6" />}
              color="amber"
            />
            <StatsCard
              title="Labour Costs"
              value={formatCurrency(maintenanceCost?.labourCostTotal || 0)}
              subtitle="Technician & service fees"
              icon={<Wrench className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Spare Parts Costs"
              value={formatCurrency(maintenanceCost?.sparePartsCostTotal || 0)}
              subtitle="Filters, oils, parts"
              icon={<Tractor className="h-6 w-6" />}
              color="purple"
            />
            <StatsCard
              title="Additional Expenses"
              value={formatCurrency(maintenanceCost?.additionalCostTotal || 0)}
              subtitle="Towing, testing, transport"
              icon={<TrendingUp className="h-6 w-6" />}
              color="zinc"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Cost by Type Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Expenditure by Maintenance Category</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceCost?.expenditureByType && maintenanceCost.expenditureByType.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={maintenanceCost.expenditureByType}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="totalCost"
                          nameKey="maintenanceType"
                          label={({ name, percent }: any) => `${name?.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                        >
                          {maintenanceCost.expenditureByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total Cost']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-zinc-400">No maintenance expenditure logged</p>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trend Bar/Area */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Maintenance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceCost?.monthlyExpenditureTrends && maintenanceCost.monthlyExpenditureTrends.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={maintenanceCost.monthlyExpenditureTrends}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), 'Cost']} />
                        <Legend />
                        <Bar dataKey="labourCost" name="Labour" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="sparePartsCost" name="Parts" stackId="a" fill="#059669" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-zinc-400">No monthly trends recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: FUEL EFFICIENCY */}
      {activeTab === 'fuel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCard
              title="Total Fuel Consumed"
              value={`${formatNumber(fuelAnalytics?.totalFuelConsumedLitres || 0, 1)} L`}
              subtitle="Fleet-wide fuel consumption"
              icon={<Fuel className="h-6 w-6" />}
              color="amber"
            />
            <StatsCard
              title="Total Fuel Cost"
              value={formatCurrency(fuelAnalytics?.totalFuelCost || 0)}
              subtitle="Fuel expenditure"
              icon={<Coins className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Avg Fuel Cost"
              value={formatCurrency(fuelAnalytics?.averageFuelCostPerLitre || 22.5, 'ZAR')}
              subtitle="Per litre diesel / petrol"
              icon={<TrendingUp className="h-6 w-6" />}
              color="blue"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Machine Fuel Burn Rate (Litres / Hour)</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelAnalytics?.equipmentConsumption && fuelAnalytics.equipmentConsumption.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fuelAnalytics.equipmentConsumption}
                      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis
                        dataKey="equipmentName"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        unit=" L/h"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip formatter={(v: number) => [`${v} L/h`, 'Burn Rate']} />
                      <Bar
                        dataKey="averageLitresPerHour"
                        name="Litres / Operating Hour"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-zinc-400">No fuel consumption logs found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

