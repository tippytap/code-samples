/////////////////////////////////////////////////////////////////////////////////////
// This is the main script file for http://globalcreativitynetwork.net. It controls
// data parsing, and builds models and views of the navigation and the descriptions
// associated with them. This script helps me maintain the content for the navigation
// which is repeated on all six pages.
/////////////////////////////////////////////////////////////////////////////////////

window.controller = window.controller || {};

(function(ns){

	// Variable to ferry events between views
	ns.event_bus = _({}).extend(Backbone.Events);

	// When DOM is loaded, pull the xml
	ns.documentReady = function(){
		ns.pullXML();
		// console.log('ready');
	};

	// Finds xml for data parsing
	ns.pullXML = function(){
		var xml = $.ajax({
			type: "GET",
			url: "xml/navigation.xml",
			dataType: "xml",
			success: ns.parseData
		});
	};

	// two separate functions for different types of data
	ns.parseData = function(xml){
		// console.log(xml);
		ns.parseMenu(xml);

		ns.parseDescription(xml);

		ns.parseSidebarData(xml);

	};

	// parses sidebar data and stores it
	ns.parseSidebarData = function(xml){
		var sidebarXML = xml.firstChild;
		var $sidebar = $(sidebarXML);
		var modules = $sidebar.children('module');

		ns.modulesArray = [];

		$(modules).each(function(){
			var modulesObject = {};
			var modulesXML = $(this)[0];
			modulesObject.header = $(modulesXML).children('header').text();
			modulesObject.contents = $(modulesXML).children('content').text();
			ns.modulesArray.push(modulesObject);
		});

		ns.createSidebar(ns.modulesArray);
	};


	// model and view for sidebar items
	ns.SidebarModel = Backbone.Model.extend({
		defaults:{}
	});
	ns.SidebarView = Backbone.View.extend({

		initialize: function(){},

		render: function(){
			var template = $("#sidbar_modules").html();

			var html = _.template(template, this.model.get('data'));

			this.$el.html(html);

			return this.$el;
		}

	});

	// builds sidebar in the dom
	ns.createSidebar = function(data){
		for(var i = 0; i < data.length; i++){
			module = data[i];
			var sidebarModel = new ns.SidebarModel({
				'data': module
			});
			var sidebarView = new ns.SidebarView({
				model: sidebarModel
			});
			$('#sidebar').append(sidebarView.render());
		}
	};

	// Grab data to build the navigation menu with
	ns.parseMenu = function(xml){
		// console.log(xml);
		var navXML = xml.firstChild;
		var $navXML = $(navXML);
		var menu = $navXML.children('menu');
		var item = $(menu).children('item');

		ns.menuArray = [];

		$(item).each(function(){
			var itemObject = {};
			var itemXML = $(this)[0];
			itemObject.text = $(itemXML).text();
			itemObject.id = $(itemXML).attr('id');
			ns.menuArray.push(itemObject);
		});

		ns.createNavMenu(ns.menuArray);
		// console.log('menu parsed');

	};

	// build Models and views for individual menu items in the nav
	ns.NavMenuItemModel = Backbone.Model.extend({
		defaults: {

		}
	});
	ns.NavMenuItemView = Backbone.View.extend({
		
		className: 'col-1-5',
		tagName: 'li',

		events: {
			'click': 'revealSection'
		},

		initialize: function(){
		},

		render: function(){

			var template = $('#navItem').html();

			var html = _.template(template, this.model.get('menuItem'));

			this.$el.html(html);

			return this.$el;

		},

		// Sends event out for another view to respond
		revealSection: function(event){
	    	event.preventDefault();
	    	var nav = $(this.$el).find('a');
	    	var nav_id = nav.attr('id').split('_', 2);
			ns.event_bus.trigger('revealSelection', [nav_id]);
		}

	});

	// loops through the data and renders out navigation to the DOM
	ns.createNavMenu = function(data){
		// console.log(data);
		for (var i = 0; i < data.length; i++){
			var menuItem = data[i];
			var menuItemModel = new ns.NavMenuItemModel({
				'menuItem': menuItem
			});

			var menuItemView = new ns.NavMenuItemView({
				model: menuItemModel
			});

			$('#header-nav > ul').append(menuItemView.render());
			console.log('menu created');
		}

	};

	// parses xml for description data, to supplement navigation
	ns.parseDescription = function(xml){

		var navXML = xml.firstChild;
		var $navXML = $(navXML);

		var descriptions = $navXML.children('descriptions');
		var item = $(descriptions).children('item');

		ns.descriptionsArray = [];

		$(item).each(function(){
			var descriptionItem = {};
			var descriptionXML = $(this)[0];
			descriptionItem.readMore = ns.stringToBoolean($(descriptionXML).attr('readMore'));
			descriptionItem.titleCentered = ns.stringToBoolean($(descriptionXML).find("title").attr('centered'));
			descriptionItem.className = $(descriptionXML).attr('className');
			descriptionItem.title = $(descriptionXML).children('title').text();
			descriptionItem.link = $(descriptionXML).children('link').text();
			descriptionItem.text = $(descriptionXML).children('paragraph').text();
			ns.descriptionsArray.push(descriptionItem);
		});
		ns.createDescriptions(ns.descriptionsArray);
	};

	// this is a unit that returns boolean true or false
	ns.stringToBoolean = function(string){
		var val = "";
		if(string == "true"){
			val = (string === "true");
		}else{
			val = (string === "false");
		}
		return val;
	};

	// Define description model and view
	ns.DescriptionsModel = Backbone.Model.extend({
		defaults: {}
	});
	ns.DescriptionsView = Backbone.View.extend({
		className: 'widget clearfix',

		events: {},

		initialize: function(){
			this.listenTo(ns.event_bus, 'revealSelection', this.expandView);
		},

		render: function(){
			var description = $('#navDescription').html();
			var readMore = this.evalReadMore(this.model.get('descriptionItem'));
			var template = description + readMore;
			var html = _.template(template, this.model.get('descriptionItem'));
			this.$el.html(html);
			return this.$el;
		},

		evalDescriptionTemplate: function(){
			var model = this.model.get('descriptionItem');
			var readMore = model.readMore;
			var titleCentered = model.titleCentered;
			console.log(titleCentered);
			if(readMore != true){
				this.$el.children('div:first').removeClass('col-2-3');
			}
			if(titleCentered == true){
				this.$el.find('h3').addClass('text-center');
			}
		},

		evalReadMore: function(model){
			if(model.readMore == true){
				return $('#readMore').html();
			}else{
				return "";
			}
		},

		expandView: function(event){
	    	this.$el.each(function(){
	    		var excerptClass = $(this).children('div:first').attr('class').split("_", 2);
	    		var nav_data = event[0];
	    		var nav_id = nav_data[1];
	    		if( nav_id == excerptClass[1] ){

	    			if($(this).hasClass('selected')){
	    			 	// do nothing
	    			}
	    			else{
	    				$('.selected').slideUp().removeClass('selected');
	                	$(this).addClass('selected').slideDown(scrollTo());
	            	}
	    		}
	    	});
		}

	});

	// loops through description data and creates views to correspond to the navigation items
	ns.createDescriptions = function(data){
		for (var i = 0; i < data.length; i++){
			var descriptionItem = data[i];
			var descriptionItemModel = new ns.DescriptionsModel({
				'descriptionItem': descriptionItem
			});
			var descriptionItemView = new ns.DescriptionsView({
				model: descriptionItemModel
			});
			$('#excerpts').append(descriptionItemView.render());
			descriptionItemView.evalDescriptionTemplate();
		};
		$('#excerpts').children('.widget').find('.exit').each(function(){
			$(this).on('click', ns.closeSection);
		});
	};

	// closes the currently opened description
	ns.closeSection = function(e){
		var excerpts = $('#excerpts');
		excerpts.find('.selected').removeClass('selected').slideUp();
	};
	// closes news section
	ns.closeNews = function(){
		var $news = $('#news');
		var exit = $news.children('.exit');
		$(exit).on('click', function(){
			$news.slideUp();
		});
	}

})(window.controller);