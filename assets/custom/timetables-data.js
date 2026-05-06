/**
 * Route catalog for Connect Transit timetable demo.
 *
 * In production these objects would be authored in the CMS. The shape is
 * intentionally simple so editors can tab between cells when adding times.
 *
 *   id          GMV "map?route=" identifier (drives the live-map iframe).
 *   number      Short route designator displayed on the badge.
 *   name        Human-readable route name.
 *   color       Hex code chosen by the editor; everything tints from this.
 *   summary     One-line description.
 *   serviceAlert  { active, headline, body } (optional; omit to hide).
 *   schedules   Map of day "weekday" | "saturday" | "sunday" each holding
 *               an array of direction objects:
 *                 { name, stops: [...], trips: [[time, time, ...], ...] }
 *               trips[i][j] is the time the trip reaches stops[j].
 *               Use "—" for "does not stop on this trip".
 */
window.CONNECT_ROUTES = [
  {
    id: '1813',
    number: '1',
    name: 'Blue Route',
    color: '#1F6FB5',
    summary: 'Downtown Bloomington to Eastland Mall via Veterans Parkway',
    serviceAlert: {
      active: true,
      headline: 'Detour in effect through May 6',
      body: 'Eastbound trips will bypass the Front & East stop due to street resurfacing. Use the temporary stop at Front & Prairie.'
    },
    schedules: {
      weekday: [
        {
          name: 'Eastbound',
          stops: ['Downtown Transfer', 'Main & Locust', 'Veterans & Empire', 'College & Towanda', 'Eastland Mall'],
          trips: [
            ['6:00a', '6:09a', '6:18a', '6:26a', '6:35a'],
            ['6:30a', '6:39a', '6:48a', '6:56a', '7:05a'],
            ['7:00a', '7:09a', '7:18a', '7:26a', '7:35a'],
            ['7:30a', '7:39a', '7:48a', '7:56a', '8:05a'],
            ['8:00a', '8:09a', '8:18a', '8:26a', '8:35a'],
            ['8:30a', '8:39a', '8:48a', '8:56a', '9:05a'],
            ['9:00a', '9:09a', '9:18a', '9:26a', '9:35a'],
            ['10:00a', '10:09a', '10:18a', '10:26a', '10:35a'],
            ['11:00a', '11:09a', '11:18a', '11:26a', '11:35a'],
            ['12:00p', '12:09p', '12:18p', '12:26p', '12:35p'],
            ['1:00p', '1:09p', '1:18p', '1:26p', '1:35p'],
            ['2:00p', '2:09p', '2:18p', '2:26p', '2:35p'],
            ['3:00p', '3:09p', '3:18p', '3:26p', '3:35p'],
            ['4:00p', '4:09p', '4:18p', '4:26p', '4:35p'],
            ['5:00p', '5:09p', '5:18p', '5:26p', '5:35p'],
            ['6:00p', '6:09p', '6:18p', '6:26p', '6:35p'],
            ['7:00p', '7:09p', '7:18p', '7:26p', '7:35p'],
            ['8:00p', '8:09p', '8:18p', '8:26p', '8:35p'],
            ['9:00p', '9:09p', '9:18p', '9:26p', '9:35p']
          ]
        },
        {
          name: 'Westbound',
          stops: ['Eastland Mall', 'College & Towanda', 'Veterans & Empire', 'Main & Locust', 'Downtown Transfer'],
          trips: [
            ['6:35a', '6:44a', '6:52a', '7:01a', '7:10a'],
            ['7:05a', '7:14a', '7:22a', '7:31a', '7:40a'],
            ['7:35a', '7:44a', '7:52a', '8:01a', '8:10a'],
            ['8:05a', '8:14a', '8:22a', '8:31a', '8:40a'],
            ['8:35a', '8:44a', '8:52a', '9:01a', '9:10a'],
            ['9:05a', '9:14a', '9:22a', '9:31a', '9:40a'],
            ['9:35a', '9:44a', '9:52a', '10:01a', '10:10a'],
            ['10:35a', '10:44a', '10:52a', '11:01a', '11:10a'],
            ['11:35a', '11:44a', '11:52a', '12:01p', '12:10p'],
            ['12:35p', '12:44p', '12:52p', '1:01p', '1:10p'],
            ['1:35p', '1:44p', '1:52p', '2:01p', '2:10p'],
            ['2:35p', '2:44p', '2:52p', '3:01p', '3:10p'],
            ['3:35p', '3:44p', '3:52p', '4:01p', '4:10p'],
            ['4:35p', '4:44p', '4:52p', '5:01p', '5:10p'],
            ['5:35p', '5:44p', '5:52p', '6:01p', '6:10p'],
            ['6:35p', '6:44p', '6:52p', '7:01p', '7:10p'],
            ['7:35p', '7:44p', '7:52p', '8:01p', '8:10p'],
            ['8:35p', '8:44p', '8:52p', '9:01p', '9:10p'],
            ['9:35p', '9:44p', '9:52p', '10:01p', '10:10p']
          ]
        }
      ],
      saturday: [
        {
          name: 'Eastbound',
          stops: ['Downtown Transfer', 'Main & Locust', 'Veterans & Empire', 'College & Towanda', 'Eastland Mall'],
          trips: [
            ['7:00a', '7:09a', '7:18a', '7:26a', '7:35a'],
            ['8:00a', '8:09a', '8:18a', '8:26a', '8:35a'],
            ['9:00a', '9:09a', '9:18a', '9:26a', '9:35a'],
            ['10:00a', '10:09a', '10:18a', '10:26a', '10:35a'],
            ['11:00a', '11:09a', '11:18a', '11:26a', '11:35a'],
            ['12:00p', '12:09p', '12:18p', '12:26p', '12:35p'],
            ['1:00p', '1:09p', '1:18p', '1:26p', '1:35p'],
            ['2:00p', '2:09p', '2:18p', '2:26p', '2:35p'],
            ['3:00p', '3:09p', '3:18p', '3:26p', '3:35p'],
            ['4:00p', '4:09p', '4:18p', '4:26p', '4:35p'],
            ['5:00p', '5:09p', '5:18p', '5:26p', '5:35p'],
            ['6:00p', '6:09p', '6:18p', '6:26p', '6:35p']
          ]
        },
        {
          name: 'Westbound',
          stops: ['Eastland Mall', 'College & Towanda', 'Veterans & Empire', 'Main & Locust', 'Downtown Transfer'],
          trips: [
            ['7:35a', '7:44a', '7:52a', '8:01a', '8:10a'],
            ['8:35a', '8:44a', '8:52a', '9:01a', '9:10a'],
            ['9:35a', '9:44a', '9:52a', '10:01a', '10:10a'],
            ['10:35a', '10:44a', '10:52a', '11:01a', '11:10a'],
            ['11:35a', '11:44a', '11:52a', '12:01p', '12:10p'],
            ['12:35p', '12:44p', '12:52p', '1:01p', '1:10p'],
            ['1:35p', '1:44p', '1:52p', '2:01p', '2:10p'],
            ['2:35p', '2:44p', '2:52p', '3:01p', '3:10p'],
            ['3:35p', '3:44p', '3:52p', '4:01p', '4:10p'],
            ['4:35p', '4:44p', '4:52p', '5:01p', '5:10p'],
            ['5:35p', '5:44p', '5:52p', '6:01p', '6:10p'],
            ['6:35p', '6:44p', '6:52p', '7:01p', '7:10p']
          ]
        }
      ]
      // sunday omitted — hidden from the day toggle when undefined.
    }
  },
  {
    id: '1820',
    number: '2',
    name: 'Green Route',
    color: '#2E8B4A',
    summary: 'Downtown Bloomington to Heartland Community College',
    schedules: {
      weekday: [
        {
          name: 'Northbound',
          stops: ['Downtown Transfer', 'Front & Center', 'IWU Campus', 'Hovey Hall', 'Heartland College'],
          trips: [
            ['6:15a', '6:22a', '6:30a', '6:38a', '6:50a'],
            ['6:45a', '6:52a', '7:00a', '7:08a', '7:20a'],
            ['7:15a', '7:22a', '7:30a', '7:38a', '7:50a'],
            ['7:45a', '7:52a', '8:00a', '8:08a', '8:20a'],
            ['8:15a', '8:22a', '8:30a', '8:38a', '8:50a'],
            ['9:15a', '9:22a', '9:30a', '9:38a', '9:50a'],
            ['10:15a', '10:22a', '10:30a', '10:38a', '10:50a'],
            ['11:15a', '11:22a', '11:30a', '11:38a', '11:50a'],
            ['12:15p', '12:22p', '12:30p', '12:38p', '12:50p'],
            ['1:15p', '1:22p', '1:30p', '1:38p', '1:50p'],
            ['2:15p', '2:22p', '2:30p', '2:38p', '2:50p'],
            ['3:15p', '3:22p', '3:30p', '3:38p', '3:50p'],
            ['4:15p', '4:22p', '4:30p', '4:38p', '4:50p'],
            ['5:15p', '5:22p', '5:30p', '5:38p', '5:50p'],
            ['6:15p', '6:22p', '6:30p', '6:38p', '6:50p'],
            ['7:15p', '7:22p', '7:30p', '7:38p', '7:50p'],
            ['8:15p', '8:22p', '8:30p', '8:38p', '8:50p']
          ]
        },
        {
          name: 'Southbound',
          stops: ['Heartland College', 'Hovey Hall', 'IWU Campus', 'Front & Center', 'Downtown Transfer'],
          trips: [
            ['6:50a', '7:02a', '7:10a', '7:18a', '7:25a'],
            ['7:20a', '7:32a', '7:40a', '7:48a', '7:55a'],
            ['7:50a', '8:02a', '8:10a', '8:18a', '8:25a'],
            ['8:20a', '8:32a', '8:40a', '8:48a', '8:55a'],
            ['8:50a', '9:02a', '9:10a', '9:18a', '9:25a'],
            ['9:50a', '10:02a', '10:10a', '10:18a', '10:25a'],
            ['10:50a', '11:02a', '11:10a', '11:18a', '11:25a'],
            ['11:50a', '12:02p', '12:10p', '12:18p', '12:25p'],
            ['12:50p', '1:02p', '1:10p', '1:18p', '1:25p'],
            ['1:50p', '2:02p', '2:10p', '2:18p', '2:25p'],
            ['2:50p', '3:02p', '3:10p', '3:18p', '3:25p'],
            ['3:50p', '4:02p', '4:10p', '4:18p', '4:25p'],
            ['4:50p', '5:02p', '5:10p', '5:18p', '5:25p'],
            ['5:50p', '6:02p', '6:10p', '6:18p', '6:25p'],
            ['6:50p', '7:02p', '7:10p', '7:18p', '7:25p'],
            ['7:50p', '8:02p', '8:10p', '8:18p', '8:25p'],
            ['8:50p', '9:02p', '9:10p', '9:18p', '9:25p']
          ]
        }
      ],
      saturday: [
        {
          name: 'Northbound',
          stops: ['Downtown Transfer', 'Front & Center', 'IWU Campus', 'Hovey Hall', 'Heartland College'],
          trips: [
            ['7:15a', '7:22a', '7:30a', '7:38a', '7:50a'],
            ['8:15a', '8:22a', '8:30a', '8:38a', '8:50a'],
            ['9:15a', '9:22a', '9:30a', '9:38a', '9:50a'],
            ['10:15a', '10:22a', '10:30a', '10:38a', '10:50a'],
            ['11:15a', '11:22a', '11:30a', '11:38a', '11:50a'],
            ['12:15p', '12:22p', '12:30p', '12:38p', '12:50p'],
            ['1:15p', '1:22p', '1:30p', '1:38p', '1:50p'],
            ['2:15p', '2:22p', '2:30p', '2:38p', '2:50p'],
            ['3:15p', '3:22p', '3:30p', '3:38p', '3:50p'],
            ['4:15p', '4:22p', '4:30p', '4:38p', '4:50p'],
            ['5:15p', '5:22p', '5:30p', '5:38p', '5:50p']
          ]
        },
        {
          name: 'Southbound',
          stops: ['Heartland College', 'Hovey Hall', 'IWU Campus', 'Front & Center', 'Downtown Transfer'],
          trips: [
            ['7:50a', '8:02a', '8:10a', '8:18a', '8:25a'],
            ['8:50a', '9:02a', '9:10a', '9:18a', '9:25a'],
            ['9:50a', '10:02a', '10:10a', '10:18a', '10:25a'],
            ['10:50a', '11:02a', '11:10a', '11:18a', '11:25a'],
            ['11:50a', '12:02p', '12:10p', '12:18p', '12:25p'],
            ['12:50p', '1:02p', '1:10p', '1:18p', '1:25p'],
            ['1:50p', '2:02p', '2:10p', '2:18p', '2:25p'],
            ['2:50p', '3:02p', '3:10p', '3:18p', '3:25p'],
            ['3:50p', '4:02p', '4:10p', '4:18p', '4:25p'],
            ['4:50p', '5:02p', '5:10p', '5:18p', '5:25p'],
            ['5:50p', '6:02p', '6:10p', '6:18p', '6:25p']
          ]
        }
      ]
    }
  },
  {
    id: '1834',
    number: '3',
    name: 'Red Route',
    color: '#C7392F',
    summary: 'West Market loop via Mitsubishi Motorway',
    schedules: {
      weekday: [
        {
          name: 'Loop',
          stops: ['Downtown Transfer', 'Market & White Oak', 'Mitsubishi Motorway', 'Wylie & Vandenberg', 'Front & Mason', 'Downtown Transfer'],
          trips: [
            ['6:10a', '6:20a', '6:30a', '6:40a', '6:48a', '6:55a'],
            ['7:10a', '7:20a', '7:30a', '7:40a', '7:48a', '7:55a'],
            ['8:10a', '8:20a', '8:30a', '8:40a', '8:48a', '8:55a'],
            ['9:10a', '9:20a', '9:30a', '9:40a', '9:48a', '9:55a'],
            ['10:10a', '10:20a', '10:30a', '10:40a', '10:48a', '10:55a'],
            ['11:10a', '11:20a', '11:30a', '11:40a', '11:48a', '11:55a'],
            ['12:10p', '12:20p', '12:30p', '12:40p', '12:48p', '12:55p'],
            ['1:10p', '1:20p', '1:30p', '1:40p', '1:48p', '1:55p'],
            ['2:10p', '2:20p', '2:30p', '2:40p', '2:48p', '2:55p'],
            ['3:10p', '3:20p', '3:30p', '3:40p', '3:48p', '3:55p'],
            ['4:10p', '4:20p', '4:30p', '4:40p', '4:48p', '4:55p'],
            ['5:10p', '5:20p', '5:30p', '5:40p', '5:48p', '5:55p'],
            ['6:10p', '6:20p', '6:30p', '6:40p', '6:48p', '6:55p']
          ]
        }
      ],
      saturday: [
        {
          name: 'Loop',
          stops: ['Downtown Transfer', 'Market & White Oak', 'Mitsubishi Motorway', 'Wylie & Vandenberg', 'Front & Mason', 'Downtown Transfer'],
          trips: [
            ['8:10a', '8:20a', '8:30a', '8:40a', '8:48a', '8:55a'],
            ['10:10a', '10:20a', '10:30a', '10:40a', '10:48a', '10:55a'],
            ['12:10p', '12:20p', '12:30p', '12:40p', '12:48p', '12:55p'],
            ['2:10p', '2:20p', '2:30p', '2:40p', '2:48p', '2:55p'],
            ['4:10p', '4:20p', '4:30p', '4:40p', '4:48p', '4:55p']
          ]
        }
      ]
    }
  },
  {
    id: '1847',
    number: '6',
    name: 'Redbird Express',
    color: '#CE1126',
    summary: 'Free shuttle for ISU students between campus and Uptown Normal',
    serviceAlert: {
      active: true,
      headline: 'No service Saturday, May 3',
      body: 'The Redbird Express does not operate during the spring break weekend. Service resumes Sunday morning.'
    },
    schedules: {
      weekday: [
        {
          name: 'Loop',
          stops: ['Bone Student Center', 'College & School', 'Uptown Station', 'Beaufort & University', 'Bone Student Center'],
          trips: [
            ['7:00a', '7:08a', '7:14a', '7:22a', '7:30a'],
            ['7:15a', '7:23a', '7:29a', '7:37a', '7:45a'],
            ['7:30a', '7:38a', '7:44a', '7:52a', '8:00a'],
            ['7:45a', '7:53a', '7:59a', '8:07a', '8:15a'],
            ['8:00a', '8:08a', '8:14a', '8:22a', '8:30a'],
            ['8:15a', '8:23a', '8:29a', '8:37a', '8:45a'],
            ['8:30a', '8:38a', '8:44a', '8:52a', '9:00a'],
            ['9:00a', '9:08a', '9:14a', '9:22a', '9:30a'],
            ['9:30a', '9:38a', '9:44a', '9:52a', '10:00a'],
            ['10:00a', '10:08a', '10:14a', '10:22a', '10:30a'],
            ['10:30a', '10:38a', '10:44a', '10:52a', '11:00a'],
            ['11:00a', '11:08a', '11:14a', '11:22a', '11:30a'],
            ['11:30a', '11:38a', '11:44a', '11:52a', '12:00p'],
            ['12:00p', '12:08p', '12:14p', '12:22p', '12:30p'],
            ['12:30p', '12:38p', '12:44p', '12:52p', '1:00p'],
            ['1:00p', '1:08p', '1:14p', '1:22p', '1:30p'],
            ['1:30p', '1:38p', '1:44p', '1:52p', '2:00p'],
            ['2:00p', '2:08p', '2:14p', '2:22p', '2:30p'],
            ['2:30p', '2:38p', '2:44p', '2:52p', '3:00p'],
            ['3:00p', '3:08p', '3:14p', '3:22p', '3:30p']
          ]
        }
      ]
    }
  },
  {
    id: '1856',
    number: '4',
    name: 'Olive Route',
    color: '#7A8B3A',
    summary: 'East Bloomington to Downtown via Oakland Avenue',
    schedules: {
      weekday: [
        {
          name: 'Inbound',
          stops: ['Eastland Mall', 'Veterans & Oakland', 'Oakland & Morrissey', 'Front & East', 'Downtown Transfer'],
          trips: [
            ['6:25a', '6:33a', '6:41a', '6:49a', '6:55a'],
            ['7:25a', '7:33a', '7:41a', '7:49a', '7:55a'],
            ['8:25a', '8:33a', '8:41a', '8:49a', '8:55a'],
            ['9:25a', '9:33a', '9:41a', '9:49a', '9:55a'],
            ['10:25a', '10:33a', '10:41a', '10:49a', '10:55a'],
            ['11:25a', '11:33a', '11:41a', '11:49a', '11:55a'],
            ['12:25p', '12:33p', '12:41p', '12:49p', '12:55p'],
            ['1:25p', '1:33p', '1:41p', '1:49p', '1:55p'],
            ['2:25p', '2:33p', '2:41p', '2:49p', '2:55p'],
            ['3:25p', '3:33p', '3:41p', '3:49p', '3:55p'],
            ['4:25p', '4:33p', '4:41p', '4:49p', '4:55p'],
            ['5:25p', '5:33p', '5:41p', '5:49p', '5:55p'],
            ['6:25p', '6:33p', '6:41p', '6:49p', '6:55p']
          ]
        },
        {
          name: 'Outbound',
          stops: ['Downtown Transfer', 'Front & East', 'Oakland & Morrissey', 'Veterans & Oakland', 'Eastland Mall'],
          trips: [
            ['7:00a', '7:06a', '7:14a', '7:22a', '7:30a'],
            ['8:00a', '8:06a', '8:14a', '8:22a', '8:30a'],
            ['9:00a', '9:06a', '9:14a', '9:22a', '9:30a'],
            ['10:00a', '10:06a', '10:14a', '10:22a', '10:30a'],
            ['11:00a', '11:06a', '11:14a', '11:22a', '11:30a'],
            ['12:00p', '12:06p', '12:14p', '12:22p', '12:30p'],
            ['1:00p', '1:06p', '1:14p', '1:22p', '1:30p'],
            ['2:00p', '2:06p', '2:14p', '2:22p', '2:30p'],
            ['3:00p', '3:06p', '3:14p', '3:22p', '3:30p'],
            ['4:00p', '4:06p', '4:14p', '4:22p', '4:30p'],
            ['5:00p', '5:06p', '5:14p', '5:22p', '5:30p'],
            ['6:00p', '6:06p', '6:14p', '6:22p', '6:30p'],
            ['7:00p', '7:06p', '7:14p', '7:22p', '7:30p']
          ]
        }
      ]
    }
  },
  {
    id: '1862',
    number: '5',
    name: 'Gold Route',
    color: '#C8A028',
    summary: 'Hershey Road corridor with service to BroMenn Hospital',
    schedules: {
      weekday: [
        {
          name: 'Northbound',
          stops: ['Downtown Transfer', 'Empire & Hershey', 'BroMenn Hospital', 'Hershey & College', 'College & Airport'],
          trips: [
            ['6:05a', '6:14a', '6:22a', '6:30a', '6:40a'],
            ['7:05a', '7:14a', '7:22a', '7:30a', '7:40a'],
            ['8:05a', '8:14a', '8:22a', '8:30a', '8:40a'],
            ['9:05a', '9:14a', '9:22a', '9:30a', '9:40a'],
            ['10:05a', '10:14a', '10:22a', '10:30a', '10:40a'],
            ['11:05a', '11:14a', '11:22a', '11:30a', '11:40a'],
            ['12:05p', '12:14p', '12:22p', '12:30p', '12:40p'],
            ['1:05p', '1:14p', '1:22p', '1:30p', '1:40p'],
            ['2:05p', '2:14p', '2:22p', '2:30p', '2:40p'],
            ['3:05p', '3:14p', '3:22p', '3:30p', '3:40p'],
            ['4:05p', '4:14p', '4:22p', '4:30p', '4:40p'],
            ['5:05p', '5:14p', '5:22p', '5:30p', '5:40p'],
            ['6:05p', '6:14p', '6:22p', '6:30p', '6:40p']
          ]
        },
        {
          name: 'Southbound',
          stops: ['College & Airport', 'Hershey & College', 'BroMenn Hospital', 'Empire & Hershey', 'Downtown Transfer'],
          trips: [
            ['6:40a', '6:50a', '6:58a', '7:06a', '7:15a'],
            ['7:40a', '7:50a', '7:58a', '8:06a', '8:15a'],
            ['8:40a', '8:50a', '8:58a', '9:06a', '9:15a'],
            ['9:40a', '9:50a', '9:58a', '10:06a', '10:15a'],
            ['10:40a', '10:50a', '10:58a', '11:06a', '11:15a'],
            ['11:40a', '11:50a', '11:58a', '12:06p', '12:15p'],
            ['12:40p', '12:50p', '12:58p', '1:06p', '1:15p'],
            ['1:40p', '1:50p', '1:58p', '2:06p', '2:15p'],
            ['2:40p', '2:50p', '2:58p', '3:06p', '3:15p'],
            ['3:40p', '3:50p', '3:58p', '4:06p', '4:15p'],
            ['4:40p', '4:50p', '4:58p', '5:06p', '5:15p'],
            ['5:40p', '5:50p', '5:58p', '6:06p', '6:15p'],
            ['6:40p', '6:50p', '6:58p', '7:06p', '7:15p']
          ]
        }
      ],
      saturday: [
        {
          name: 'Northbound',
          stops: ['Downtown Transfer', 'Empire & Hershey', 'BroMenn Hospital', 'Hershey & College', 'College & Airport'],
          trips: [
            ['8:05a', '8:14a', '8:22a', '8:30a', '8:40a'],
            ['9:05a', '9:14a', '9:22a', '9:30a', '9:40a'],
            ['10:05a', '10:14a', '10:22a', '10:30a', '10:40a'],
            ['11:05a', '11:14a', '11:22a', '11:30a', '11:40a'],
            ['12:05p', '12:14p', '12:22p', '12:30p', '12:40p'],
            ['1:05p', '1:14p', '1:22p', '1:30p', '1:40p'],
            ['2:05p', '2:14p', '2:22p', '2:30p', '2:40p'],
            ['3:05p', '3:14p', '3:22p', '3:30p', '3:40p'],
            ['4:05p', '4:14p', '4:22p', '4:30p', '4:40p']
          ]
        },
        {
          name: 'Southbound',
          stops: ['College & Airport', 'Hershey & College', 'BroMenn Hospital', 'Empire & Hershey', 'Downtown Transfer'],
          trips: [
            ['8:40a', '8:50a', '8:58a', '9:06a', '9:15a'],
            ['9:40a', '9:50a', '9:58a', '10:06a', '10:15a'],
            ['10:40a', '10:50a', '10:58a', '11:06a', '11:15a'],
            ['11:40a', '11:50a', '11:58a', '12:06p', '12:15p'],
            ['12:40p', '12:50p', '12:58p', '1:06p', '1:15p'],
            ['1:40p', '1:50p', '1:58p', '2:06p', '2:15p'],
            ['2:40p', '2:50p', '2:58p', '3:06p', '3:15p'],
            ['3:40p', '3:50p', '3:58p', '4:06p', '4:15p'],
            ['4:40p', '4:50p', '4:58p', '5:06p', '5:15p']
          ]
        }
      ]
    }
  },
  {
    id: '1875',
    number: '7',
    name: 'Lime Route',
    color: '#9ACA3C',
    summary: 'Wylie & Towanda neighborhood circulator',
    schedules: {
      weekday: [
        {
          name: 'Loop',
          stops: ['Downtown Transfer', 'Wylie & Veterans', 'Wylie & Towanda', 'Empire & Hershey', 'Front & Mason', 'Downtown Transfer'],
          trips: [
            ['6:20a', '6:30a', '6:40a', '6:50a', '6:58a', '7:05a'],
            ['7:20a', '7:30a', '7:40a', '7:50a', '7:58a', '8:05a'],
            ['8:20a', '8:30a', '8:40a', '8:50a', '8:58a', '9:05a'],
            ['9:20a', '9:30a', '9:40a', '9:50a', '9:58a', '10:05a'],
            ['10:20a', '10:30a', '10:40a', '10:50a', '10:58a', '11:05a'],
            ['11:20a', '11:30a', '11:40a', '11:50a', '11:58a', '12:05p'],
            ['12:20p', '12:30p', '12:40p', '12:50p', '12:58p', '1:05p'],
            ['1:20p', '1:30p', '1:40p', '1:50p', '1:58p', '2:05p'],
            ['2:20p', '2:30p', '2:40p', '2:50p', '2:58p', '3:05p'],
            ['3:20p', '3:30p', '3:40p', '3:50p', '3:58p', '4:05p'],
            ['4:20p', '4:30p', '4:40p', '4:50p', '4:58p', '5:05p'],
            ['5:20p', '5:30p', '5:40p', '5:50p', '5:58p', '6:05p'],
            ['6:20p', '6:30p', '6:40p', '6:50p', '6:58p', '7:05p']
          ]
        }
      ]
    }
  },
  {
    id: '1882',
    number: '8',
    name: 'Lavender Route',
    color: '#8E6FAA',
    summary: 'Veterans Parkway to Constitution Trail trailhead',
    schedules: {
      weekday: [
        {
          name: 'Eastbound',
          stops: ['Downtown Transfer', 'Front & Linden', 'Veterans & Six Points', 'Constitution Trail Trailhead'],
          trips: [
            ['6:50a', '7:00a', '7:10a', '7:20a'],
            ['7:50a', '8:00a', '8:10a', '8:20a'],
            ['8:50a', '9:00a', '9:10a', '9:20a'],
            ['9:50a', '10:00a', '10:10a', '10:20a'],
            ['10:50a', '11:00a', '11:10a', '11:20a'],
            ['11:50a', '12:00p', '12:10p', '12:20p'],
            ['12:50p', '1:00p', '1:10p', '1:20p'],
            ['1:50p', '2:00p', '2:10p', '2:20p'],
            ['2:50p', '3:00p', '3:10p', '3:20p'],
            ['3:50p', '4:00p', '4:10p', '4:20p'],
            ['4:50p', '5:00p', '5:10p', '5:20p'],
            ['5:50p', '6:00p', '6:10p', '6:20p']
          ]
        },
        {
          name: 'Westbound',
          stops: ['Constitution Trail Trailhead', 'Veterans & Six Points', 'Front & Linden', 'Downtown Transfer'],
          trips: [
            ['7:25a', '7:35a', '7:45a', '7:55a'],
            ['8:25a', '8:35a', '8:45a', '8:55a'],
            ['9:25a', '9:35a', '9:45a', '9:55a'],
            ['10:25a', '10:35a', '10:45a', '10:55a'],
            ['11:25a', '11:35a', '11:45a', '11:55a'],
            ['12:25p', '12:35p', '12:45p', '12:55p'],
            ['1:25p', '1:35p', '1:45p', '1:55p'],
            ['2:25p', '2:35p', '2:45p', '2:55p'],
            ['3:25p', '3:35p', '3:45p', '3:55p'],
            ['4:25p', '4:35p', '4:45p', '4:55p'],
            ['5:25p', '5:35p', '5:45p', '5:55p'],
            ['6:25p', '6:35p', '6:45p', '6:55p']
          ]
        }
      ]
    }
  }
];
