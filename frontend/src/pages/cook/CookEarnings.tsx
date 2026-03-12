import { useState, useEffect } from "react";
import { payoutApi } from "../../api/payment.api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Loader2, Wallet, TrendingUp, DollarSign, ExternalLink, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import type { Earnings, Payout } from "../../types/payment.types";

interface EarningsBreakdown {
  daily: { date: string; amount: number; orders: number }[];
  weekly: { week: string; amount: number; orders: number }[];
  monthly: { month: string; amount: number; orders: number }[];
}

export default function CookEarnings() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [earningsBreakdown, setEarningsBreakdown] = useState<EarningsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [earningsData, payoutsData, breakdownData] = await Promise.all([
        payoutApi.getEarnings(),
        payoutApi.getPayoutHistory(),
        payoutApi.getEarningsBreakdown(),
      ]);
      setEarnings(earningsData);
      setPayouts(payoutsData);
      setEarningsBreakdown(breakdownData);
    } catch (error) {
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const result = await payoutApi.createConnectAccount(user.email);
      window.location.href = result.onboardingUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to connect Stripe");
    } finally {
      setConnectLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
        <Button onClick={handleConnectStripe} disabled={connectLoading}>
          {connectLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Bank Account
            </>
          )}
        </Button>
      </div>

      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings?.totalEarnings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {earnings?.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -₹{earnings?.platformFees || 0}
            </div>
            <p className="text-xs text-muted-foreground">15% commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{earnings?.netAmount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Earnings (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningsBreakdown?.daily?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No earnings data available</p>
              ) : (
                <div className="space-y-3">
                  {earningsBreakdown?.daily?.slice(0, 10).map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}</p>
                        <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{day.amount}</p>
                        <p className="text-xs text-muted-foreground">₹{Math.round(day.amount * 0.85)} net</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Earnings (Last 12 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningsBreakdown?.weekly?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No earnings data available</p>
              ) : (
                <div className="space-y-3">
                  {earningsBreakdown?.weekly?.map((week) => (
                    <div key={week.week} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Week of {week.week}</p>
                        <p className="text-sm text-muted-foreground">{week.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{week.amount}</p>
                        <p className="text-xs text-muted-foreground">₹{Math.round(week.amount * 0.85)} net</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Earnings (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningsBreakdown?.monthly?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No earnings data available</p>
              ) : (
                <div className="space-y-3">
                  {earningsBreakdown?.monthly?.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(month.month + '-01').toLocaleDateString('en-IN', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}</p>
                        <p className="text-sm text-muted-foreground">{month.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-lg">₹{month.amount}</p>
                        <p className="text-sm text-muted-foreground">₹{Math.round(month.amount * 0.85)} net</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payouts yet</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">₹{payout.netAmount}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payout.periodStart).toLocaleDateString()} -{" "}
                      {new Date(payout.periodEnd).toLocaleDateString()}
                    </p>
                    {payout.processedAt && (
                      <p className="text-xs text-muted-foreground">
                        Processed: {new Date(payout.processedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Payout Information</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Payouts are processed weekly (every Friday)</li>
            <li>• Minimum payout amount: ₹500</li>
            <li>• Platform commission: 15% (minimum ₹10)</li>
            <li>• Connect your bank account to receive payouts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
