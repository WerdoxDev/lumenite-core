import { DeviceSequenceItems, DeviceType, SequenceItem, SequenceItemType } from "./types";

export const deviceSequeceItems: Array<DeviceSequenceItems> = [
  {
    type: DeviceType.OutputDevice,
    itemIds: [
      SequenceItemType.SetPower,
      SequenceItemType.TogglePower,
      SequenceItemType.If,
      SequenceItemType.Loop,
      SequenceItemType.WaitInSeconds,
    ],
  },
];

export const sequenceItems: Array<SequenceItem> = [
  { id: 0, tabId: 0, text: "Set power" },
  { id: 1, tabId: 0, text: "Toggle power" },
  { id: 2, tabId: 1, text: "If" },
  { id: 3, tabId: 1, text: "Loop" },
  { id: 4, tabId: 2, text: "Wait in seconds" },
];

export function getDeviceSequenceItems(type: DeviceType) {
  var items: Array<SequenceItem> = [];
  const deviceSequences = deviceSequeceItems.find((x) => x.type === type);
  deviceSequences.itemIds.forEach((x) => {
    var sequenceItem = sequenceItems.find((y) => y.id === x);
    if (sequenceItem) items.push(sequenceItem);
  });
  return items;
}
