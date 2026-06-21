import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlayfulBackground from "@/components/PlayfulBackground";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { getChildren } from "@/lib/children";
import { getChildReport } from "@/lib/reports";

import { BookOpen, Trophy, Target, FileText } from "lucide-react";

type Report = {
  id: number;
  storyId: number;
  overallScore: number;
  goalAchievement: number;
  summary: string;
  createdAt: string;

  story: {
    id: number;
    title: string;
    educationalGoal: string;
    createdAt: string;
  };
};

export default function Reports() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(false);

  //useeffect to get children's names and select a child
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await getChildren();

        setChildren(res.data || []);

        if (res.data?.length > 0) {
          setSelectedChild(res.data[0].id);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadChildren();
  }, []);
  //useeffect to get reports
  useEffect(() => {
    if (!selectedChild) return;
    const loadReports = async () => {
      try {
        setLoading(true);
        const res = await getChildReport(selectedChild);
        setReports(res.data.reports || "");
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [selectedChild]);

  const stats = useMemo(() => {
    const storiesCount = reports.length;

    const avgScore =
      storiesCount === 0
        ? 0
        : Math.round(
            reports.reduce((acc, r) => acc + r.overallScore, 0) / storiesCount,
          );

    const avgGoal =
      storiesCount === 0
        ? 0
        : Math.round(
            reports.reduce((acc, r) => acc + r.goalAchievement, 0) /
              storiesCount,
          );

    return {
      storiesCount,
      avgScore,
      avgGoal,
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-background relative">
      <PlayfulBackground />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6"> {t("reports")} 📊</h1>

        <Select
          value={selectedChild ? String(selectedChild) : ""}
          onValueChange={(value) => setSelectedChild(Number(value))}
        >
          <SelectTrigger className="w-[250px] mb-8">
            <SelectValue placeholder={t("chooseChild")} />
          </SelectTrigger>

          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={String(child.id)}>
                {child.firstName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-5 border">
            <BookOpen className="mb-2" />
            <p className="text-sm text-muted-foreground">{t("stories")}</p>
            <h2 className="text-3xl font-bold">{stats.storiesCount}</h2>
          </div>

          <div className="bg-card rounded-2xl p-5 border">
            <Trophy className="mb-2" />
            <p className="text-sm text-muted-foreground">{t("averageScore")}</p>
            <h2 className="text-3xl font-bold">{stats.avgScore}%</h2>
          </div>

          <div className="bg-card rounded-2xl p-5 border">
            <Target className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("goalAchievement")}
            </p>
            <h2 className="text-3xl font-bold">{stats.avgGoal}%</h2>
          </div>
        </div>
        {loading ? (
          <div>{t("loading")}</div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-card border rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl">{report.story.title}</h3>

                    <p className="text-muted-foreground">
                      {report.story.educationalGoal}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>
                      {t("score")}: {report.overallScore}%
                    </p>

                    <Button
                      className="mt-2"
                      onClick={() =>
                        navigate(`/reports/story/${report.storyId}`, {
                          state: {
                            storyTitle: report.story.title,
                            educationalGoal: report.story.educationalGoal,
                          },
                        })
                      }
                    >
                      {t("viewReport")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
