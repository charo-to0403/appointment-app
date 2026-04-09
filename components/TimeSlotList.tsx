"use client";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

interface TimeSlotListProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

export default function TimeSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
}: TimeSlotListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">時間を選択</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">時間を選択</h3>
        <p className="text-gray-500 text-center py-8">
          この日は空き枠がありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">時間を選択</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.start === slot.start &&
            selectedSlot?.end === slot.end;
          return (
            <button
              key={slot.start}
              onClick={() => onSelectSlot(slot)}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all border
                ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }
              `}
            >
              {slot.display}
            </button>
          );
        })}
      </div>
    </div>
  );
}
